#!/bin/bash

COMMAND=$1

if [ "$COMMAND" = "--init" ]; then
  if [ -d "build" ]; then
    echo -e "\e[31mERROR:\e[0m Build path already exists"
    exit 1
  fi
  elm-package install &&
  git clone https://github.com/cibertexto/cibertexto.github.io.git &&
  mv "cibertexto.github.io" "build" &&
  elm-make src/Main.elm --output=build/main.js &&
  cp assets/*/* build

else if [ "$COMMAND" = "--build" ]; then
  if [ ! -d "build" ]; then
    echo -e "\e[31mERROR:\e[0m Manually run \"./run.sh --init\" to create the build path"
    exit 1
  fi
  /bin/rm -rf build/*
  echo -e "\n----------\n"
  elm-make src/Main.elm --output=build/main.js &&
  cp assets/*/* build

else if [ "$COMMAND" = "--deploy" ]; then
  if [ ! -d "build" ]; then
    echo -e "\e[31mERROR:\e[0m Manually run \"./run.sh --init\" to create the build path"
    exit 1
  fi
  cd build &&
  find . -name "*.png" -exec convert {} -resize 64 -strip -quality 75 {} \; &&
  find . -name "*.jpg" -exec convert {} -resize 64 -strip -quality 75 {} \; &&
  cp index.html 404.html &&
  git add -A &&
  git commit -m "Deployed at $( date +%d/%m/%Y )"
  git push
  cd ..

else if [[ "$COMMAND" = "--watch" ]]; then
  touch /tmp/elm_error.txt
  while true; do
    cp /tmp/elm_error.txt /tmp/elm_error.txt.old
    LOG_RESULTS=`elm-make src/Main.elm --output=build/main.js 2> /tmp/elm_error.txt`
    if [[ "$LOG_RESULTS" =~ "Successfully generated build/main.js" ]]; then
      if [[ "$LOG_RESULTS" != "$LAST_LOG_RESULTS" ]]; then
        echo -e "\n----------\n"
        echo -ne "$LOG_RESULTS"
      fi
      LAST_LOG_RESULTS=$LOG_RESULTS
    else
      DIFF_RESULT=`diff /tmp/elm_error.txt /tmp/elm_error.txt.old`
      if [ "$DIFF_RESULT" != "" ]; then
        echo -e "\n----------\n"
        pygmentize "/tmp/elm_error.txt"
      fi
    fi
    sleep 1
  done

else
  echo -e "\e[31mERROR:\e[0m Command not found"
fi fi fi fi