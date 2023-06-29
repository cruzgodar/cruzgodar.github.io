REPO_LOC=~/Desktop/90259025.github.io

node build.js $(git -C $REPO_LOC ls-files -m -o)