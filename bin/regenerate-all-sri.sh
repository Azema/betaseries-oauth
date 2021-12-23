#!/bin/bash

function update_sri() {
  file=$1
  name=$(basename "$file")
  sri=$(openssl dgst -sha384 -binary "$file" | openssl base64 -A)
  sri_esc=$(printf '%s\n' "$sri" | sed -e 's/[\/&]/\\&/g')
  #echo "sed -r -i \"s/$name:(\s*)sha384-.*$/$name:\\1sha384-$sri_esc/\" README.md"
  sed -r -i "s/$name:(\s*).*sha384-.*$/$name:\1\`sha384-$sri_esc\`/" README.md
  sed -r -i "s/$name: sha384-.*$/$name: sha384-$sri_esc/" sri.sha384
  echo "Change SRI of file $name in README and sri.sha384"
}

for file in css/*.min.css; do
  update_sri "$file";
done

for file in js/*.js; do
  update_sri "$file";
done

exit 0;