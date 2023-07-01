clean=''

while getopts 'c' flag; do
  case "${flag}" in
    c) clean='true'
  esac
done

if [[ $clean == "true" ]]
then
	node ./build/build.mjs -c
else
	node ./build/build.mjs
fi