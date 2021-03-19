import { ICruiseResult } from 'dependency-cruiser';
import React, { FC, useEffect, useState } from 'react';
import { parseModules } from '../utils/parsers';
import SelectModules from './SelectModules';

const JSON_URL =
  process.env.NODE_ENV === 'production'
    ? '../cli/reporter-output.json'
    : '../../../dist/cli/reporter-output.json';

const App: FC = () => {
  const [data, setData] = useState<ICruiseResult>();
  useEffect(() => {
    fetch(JSON_URL)
      .then(response => response.json())
      .then(json => {
        setData(json);
      });
  }, []);

  if (data == null) {
    return <em>Loading...</em>;
  }

  const modules = parseModules(data);

  return (
    <div>
      <SelectModules modules={modules} label="Root module(s)" />
      <SelectModules modules={modules} label="Leaf module(s)" />
    </div>
  );
};

export default App;
