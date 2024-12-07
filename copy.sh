#! /bin/bash

eval $(grep 'NODE_PATH=' $(PATH="$HOME/.nvm/versions/node/v22.11.0/bin:$PATH" pnpm --package=@rx-angular/import-graph-visualizer@0.2.0 -c dlx 'which import-graph-visualizer') -m 1)
DIST_PATH="$(dirname "$(dirname "$(echo $NODE_PATH | cut -d':' -f1)")")"
if [ -f "$DIST_PATH/cli/reporter-output.json" ]; then
  mv "$DIST_PATH/cli/reporter-output.json" reporter-output.sv.json
fi
cp -r ~/Documents/import-graph-visualizer/dist/* $DIST_PATH
if [ -f "reporter-output.sv.json" ]; then
  mv reporter-output.sv.json "$DIST_PATH/cli/reporter-output.json" 
fi
