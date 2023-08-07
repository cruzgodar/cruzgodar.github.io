clean=''

while getopts 'c' flag; do
  case "${flag}" in
    c) clean='true'
  esac
done

if [[ $clean == "true" ]]
then
	node ~/Desktop/cruzgodar.github.io/build/build.mjs -c
else
	node ~/Desktop/cruzgodar.github.io/build/build.mjs
fi