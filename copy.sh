#! /bin/bash
. ~/.nvm/nvm.sh
nvm use 22.11.0
eval $(grep 'NODE_PATH=' $(pnpm --package=@rx-angular/import-graph-visualizer@0.2.0 -c dlx 'which import-graph-visualizer') -m 1)
DIST_PATH="$(dirname "$(dirname "$(echo $NODE_PATH | cut -d':' -f1)")")"
cp -r ~/Documents/import-graph-visualizer/dist/* $DIST_PATH
