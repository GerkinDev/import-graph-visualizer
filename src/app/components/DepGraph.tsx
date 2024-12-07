import {
  Button,
  Icon,
  IconButton,
  Snackbar,
  SnackbarContent,
} from '@material-ui/core';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Edge, Network, Node } from 'vis-network/standalone';
import { getIconUrlByName, getIconUrlForFilePath } from 'vscode-material-icons';
import Worker from 'worker-loader!../workers/graph.worker';
import { filenameFromPath } from '../utils/format';
import { ICONS_URL } from '../utils/icons';
import { DepGraph, Filters, ModuleDeps } from '../utils/types';

type Props = {
  moduleDeps: ModuleDeps;
  filters: Filters;
  physicsSimulation: boolean;
};

type Stage = 'idle' | 'computing' | 'drawing';

const DepGraph: FC<Props> = ({ moduleDeps, filters, physicsSimulation }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [graph, setGraph] = useState<DepGraph>();

  const [worker, setWorker] = useState<Worker>();

  const [stage, setStage] = useState<Stage>('idle');
  const [network, setNetwork] = useState<Network>();

  useEffect(() => {
    setStage('computing');
    if (worker != null) {
      worker.terminate();
    }
    const newWorker = new Worker();
    newWorker.postMessage({ moduleDeps, ...filters });
    newWorker.onmessage = ({ data }: MessageEvent<DepGraph>) => {
      setGraph(data);
      setStage('drawing');
      newWorker.terminate();
    };
    setWorker(newWorker);
  }, [moduleDeps, filters]);

  useEffect(() => {
    if (containerRef.current && graph != null) {
      const nodes = graph.modules.map(
        ({ path, isLocal, isNodeBuiltIn }): Node => ({
          id: path,
          label: isLocal
            ? filenameFromPath(path)
            : isNodeBuiltIn
              ? `node:${path}`
              : path,
          title: path,
          image: isLocal
            ? getIconUrlForFilePath(path, ICONS_URL)
            : isNodeBuiltIn
              ? getIconUrlByName('nodejs', ICONS_URL)
              : getIconUrlByName('npm', ICONS_URL),
        }),
      );

      const edges = graph.imports.map(
        ({ fromPath, toPath, isDynamic }): Edge => ({
          from: fromPath,
          to: toPath,
          dashes: isDynamic,
        }),
      );

      const newNetwork = new Network(
        containerRef.current,
        { edges, nodes },
        {
          physics: { enabled: physicsSimulation },
          nodes: {
            shape: 'image',
            shapeProperties: {
              useBorderWithImage: true,
            },
            image: getIconUrlByName('file', ICONS_URL),
            color: {
              border: '#888',
              background: '#fff',
              highlight: {
                border: '#888',
                background: '#eee',
              },
            },
          },
          edges: {
            arrows: 'to',
            color: '#888',
          },
        },
      );

      newNetwork.on('afterDrawing', () => {
        setStage('idle');
      });

      setNetwork(newNetwork);
    }
  }, [containerRef.current, graph]);

  useEffect(() => {
    if (physicsSimulation) {
      network?.startSimulation();
    } else {
      network?.stopSimulation();
    }
    network?.setOptions({ physics: { enabled: physicsSimulation } });
  }, [physicsSimulation, network]);

  const handleTerminate = () => {
    if (worker != null) {
      worker.terminate();
      setWorker(undefined);
      setStage('idle');
    }
  };

  const handleDownload = () => {
    const canvas = containerRef.current?.querySelector('canvas');
    console.log(canvas);
    if (!canvas) {
      return;
    }
    const pngContent = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'graph.png';
    link.href = pngContent;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div
        style={{
          flex: 1,
          minHeight: '400px',
          width: '100%',
          border: '1px dotted grey',
          borderRadius: 4,
          marginTop: 15,
          position: 'relative',
          boxSizing: 'border-box'
        }}
      >
        <IconButton
          onClick={handleDownload}
          aria-label="Download"
          style={{
            position: 'absolute',
            right: 0,
            top: 0,
            zIndex: 1,
          }}
        >
          <Icon fontSize="small" style={{ textAlign: 'center' }}>
            <img
              src={getIconUrlByName('folder-download', ICONS_URL)}
              style={{ display: 'flex', height: 'inherit', width: 'inherit' }}
            />
          </Icon>
        </IconButton>
        <div
          ref={containerRef}
          style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}
        ></div>
      </div>
      <Snackbar open={stage === 'computing'}>
        <SnackbarContent
          message="Calculating all import paths between target and source modules..."
          action={
            <Button color="secondary" onClick={handleTerminate}>
              Terminate
            </Button>
          }
        />
      </Snackbar>
      <Snackbar open={stage === 'drawing'}>
        <SnackbarContent message="Drawing import graph to canvas..." />
      </Snackbar>
    </>
  );
};

export default DepGraph;
