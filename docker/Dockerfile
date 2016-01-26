FROM ubuntu:latest

RUN \
  apt-get update                  && \
  apt-get -y upgrade              && \
  apt-get -y install curl

RUN \
  apt-get -y install npm                                                              &&  \
  apt-get -y install git wget build-essential libtool autotools-dev automake              \
                     autoconf pkg-config libssl-dev

RUN \
  cd /opt                                                                             &&  \
  git clone -b common https://github.com/tradle/bitcore-node.git                      &&  \
  cd bitcore-node                                                                     &&  \
                                                                                          \
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.30.2/install.sh | bash &&  \
                                                                                          \
  . ~/.bashrc                                                                         &&  \
  nvm install v0.12                                                                   &&  \
                                                                                          \
  npm install -g node-gyp

RUN \
  . ~/.bashrc                                                                         &&  \
  nvm use v0.12                                                                       &&  \
                                                                                          \
  n=$(which node);n=${n%/bin/node}; chmod -R 755 $n/bin/*                             &&  \
  cp -r $n/bin/* /usr/local/bin/                                                      &&  \
  cp -r $n/lib/* /usr/local/lib/

WORKDIR /opt/bitcore-node

ENV HOME /opt/bitcore-node

RUN \
  cd $HOME                                                                            &&  \
  chown -R daemon:daemon .

USER daemon

RUN \
  cd $HOME                                                                            &&  \
                                                                                          \
  npm install                                                                         &&  \
  npm start
