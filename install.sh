if [ $OSTYPE = "darwin14" ]; then

	if [ `node -v` != "v0.12.1" ]; then
		echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
		. ~/.bashrc
		mkdir ~/local
		mkdir ~/node-latest-install
		cd ~/node-latest-install
		curl http://nodejs.org/dist/node-latest.tar.gz | tar xz --strip-components=1
		./configure --prefix=~/local
		make install
		curl https://www.npmjs.org/install.sh | sh
	fi

	git clone https://github.com/JuicyPasta/Youtube-dl ~/Youtube-dl
	npm install ~/Youtube-dl
	node ~/Youtube-dl start

fi
