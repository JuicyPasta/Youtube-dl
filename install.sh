if [ $OSTYPE = "darwin14" ]; then

	if [ `node -v` != "v0.12.4" ]; then
		echo 'export PATH=$HOME/local/bin:$PATH' >> ~/.bashrc
		. ~/.bashrc
		mkdir ~/local
		mkdir ~/node-latest-install
		cd ~/node-latest-install
		curl http://nodejs.org/dist/v0.12.4/node-v0.12.4-darwin-x86.tar.gz | tar xz --strip-components=1
		./configure --prefix=~/local
		make install
		curl https://www.npmjs.org/install.sh | sh
	fi

	git clone https://github.com/JuicyPasta/Youtube-dl ~/Youtube-dl
	cd ~/Youtube-dl
	npm install
	node app.js start

fi
