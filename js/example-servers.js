function LocalStorageService() {
	this.put = function(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}
	this.get = function(key) {
		return JSON.parse(localStorage.getItem(key));
	}
	this.clear = function() {
		localStorage.clear();
	}
}

//-----------------------------------------------------------------------------
// Reader
//-----------------------------------------------------------------------------
var reader_app = angular.module('reader', []);

reader_app.service('LocalStorage', LocalStorageService);

reader_app.service('Server', function(LocalStorage) {
	this.ls = LocalStorage;

	this.getTokens = function() {
		var tokens = this.ls.get('reader-tokens');
		if (!angular.isArray(tokens)) {
			tokens = [];
			this.saveTokens(tokens);
		}
		return tokens;
	}
	this.saveTokens = function(tokens) {
		this.ls.put('reader-tokens', tokens);
	}

	this.getAccounts = function() {
		var accounts = this.ls.get('reader-accounts');
		if (!angular.isArray(accounts)) {
			accounts = [];
			this.saveAccounts(accounts);
		}
		return accounts;
	};
	this.saveAccounts = function(accounts) {
		this.ls.put('reader-accounts', accounts);
	};

	// This simulates requesting from the remote server.
	this.dataForToken = function(token) {
		// "Request" new account information for the tokens we have.
		var bank_tokens = this.ls.get('bank-tokens');
		var bank_accounts = this.ls.get('bank-accounts');
		var all_accounts = false;
		var accounts = [];
		// find matching tokens
		angular.forEach(bank_tokens, function(bank_token) {
			if (bank_token.hash == token && bank_token.enabled) {
				// match
				if (bank_token.accounts == '') {
					all_accounts = true;
				} else {
					accounts.push(bank_token.accounts);
				}
			}
		});

		if (all_accounts) {
			return bank_accounts;
		} else {
			var ret_accounts = [];
			// find matching accounts
			angular.forEach(bank_accounts, function(bank_account) {
				if (accounts.indexOf(bank_account.simplefin_id) != -1) {
					console.log(bank_account);
					ret_accounts.push(bank_account);
				}
			});
			return ret_accounts;
		}
	}
});


reader_app.controller('ReaderCtrl', function($scope, LocalStorage, Server) {
	this.ls = LocalStorage;
	$scope.pastedToken = null;
	$scope.tokens = Server.getTokens();
	$scope.accounts = Server.getAccounts();

	$scope.$watch('tokens', function(newvalue) {
		Server.saveTokens(newvalue);
	});
	$scope.$watch('accounts', function(newvalue) {
		Server.saveAccounts(newvalue);
	});

	$scope.$watch('pastedToken', function(value) {
		// try decoding it.
		try {
			var decoded = atob(value);
			var parts = decoded.split('\n');
			var url = parts[0];
			var access_token = parts[1];
			if (access_token != null) {
				$scope.tokens.push(access_token);
				Server.saveTokens($scope.tokens);
				$scope.refresh();
			}
			$scope.pastedToken = '';
		} catch(err) {
		}
	});

	$scope.startOver = function() {
		LocalStorage.clear();
		window.location.reload();
	};

	$scope.refresh = function() {
		$scope.accounts.length = 0;
		angular.forEach($scope.tokens, function(token) {
			var data = Server.dataForToken(token);
			$scope.accounts = $scope.accounts.concat(data);
		});
		Server.saveAccounts($scope.accounts);
	};
});



//-----------------------------------------------------------------------------
// Bank
//-----------------------------------------------------------------------------
var bank_app = angular.module('bank', []);

bank_app.service('LocalStorage', LocalStorageService);
bank_app.service('Server', function(LocalStorage) {
	this.sfin_url = 'https://www.example.com/sfin';
	this.ls = LocalStorage;

	// Bank functions
	this.getAccounts = function() {
		var accounts = this.ls.get('bank-accounts');
		if (!angular.isArray(accounts)) {
			accounts = [
				{name: 'Checking', number: '1238394', balance:'12.50', simplefin_id: 'SFIN-9000002'},
				{name: 'Savings', number: '28398403', balance:'18.90', simplefin_id: 'SFIN-8840034'},
			];
			this.saveAccounts(accounts);
		}
		return accounts;
	}
	this.saveAccounts = function(accounts) {
		this.ls.put('bank-accounts', accounts);
	}
	this.getTokens = function() {
		var tokens = this.ls.get('bank-tokens');
		if (!angular.isArray(tokens)) {
			tokens = [];
			this.saveTokens(tokens);
		}
		return tokens;
	}
	this.saveTokens = function(tokens) {
		this.ls.put('bank-tokens', tokens);
	}
	this.generateSetupToken = function() {
		var charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
		var access_token = '';
		var length = 50 + Math.floor(Math.random() * 50);
		while (access_token.length < length) {
			var r = Math.floor(Math.random() * charset.length);
			access_token += charset[r];
		}
		var setup_token = btoa(this.sfin_url + '\n' + access_token);
		return {
			'access_token': access_token,
			'sfin_url': this.sfin_url,
			'setup_token': setup_token,
			// pretend to hash right now
			'hash': access_token
		}
	}
});

bank_app.controller('BankCtrl', function($scope, LocalStorage, Server) {
	var ls = LocalStorage;
	$scope.signedin = false;
	$scope.accounts = Server.getAccounts();
	$scope.tokens = Server.getTokens();
	$scope.generatedToken = null;

	$scope.$watch('tokens', function() {
		Server.saveTokens($scope.tokens);
	}, true);
	$scope.$watch('accounts', function() {
		Server.saveAccounts($scope.accounts);
	}, true);

	$scope.signin = function() {
		$scope.signedin = true;
	};

	$scope.startOver = function() {
		LocalStorage.clear();
		window.location.reload();
	};

	$scope.reset = function() {
		$scope.accountChoice = '';
		$scope.description = '';
	};

	$scope.generateToken = function() {
		var accountChoice = $scope.accountChoice;
		var description = $scope.description;
		var generated = Server.generateSetupToken();

		$scope.tokens.push({
			hash: generated.hash,
			sfin_url: generated.sfin_url,
			accounts: accountChoice,
			description: description,
			enabled: true,
			last_used_ip: null,
			last_used: null
		});
		// reset form
		$scope.reset();
		$scope.generatedToken = generated.setup_token;
	};

	$scope.deleteToken = function(token) {
		var index = $scope.tokens.indexOf(token);
		$scope.tokens.splice(index,1);
	};

	$scope.reset();
});



/*
app.service('ReaderServer', function(LocalStorage) {
	this.ls = LocalStorage;

	this.getAccounts = function() {
		return this.ls.get('reader-accounts');
	};

	this.addAccessToken = function(token) {
		var access_tokens = this.ls.get('reader-access-tokens');
		if (!angular.isArray(access_tokens)) {
			access_tokens = [];
		}
		access_tokens.push(token);
		this.ls.put('reader-access-tokens');
	}
});


//
//	Bank-resident accounts.  Normal bank stuff
//
app.controller('AccountCtrl', function($scope, Server) {
	$scope.accounts = Server.getAccounts();
});


//
//	Bank-resident, for managing tokens
//
app.controller('TokenCtrl', function($scope, Server) {
	$scope.accountChoice = 'All accounts';
	$scope.expirationDate = '2015-01-01';
	$scope.accounts = Server.getAccounts();
	$scope.tokens = Server.getTokens();

	$scope.$watch('tokens', function() {
		Server.saveTokens($scope.tokens);
	}, true);
	$scope.$watch('accounts', function() {
		Server.saveAccounts($scope.accounts);
	}, true);

	$scope.createToken = function() {
		var accountChoice = $scope.accountChoice;
		var description = $scope.description;
		var expirationDate = $scope.expirationDate;
		var generated = Server.generateSetupToken();

		$scope.tokens.push({
			hash: generated.hash,
			sfin_url: generated.sfin_url,
			accounts: accountChoice,
			description: description,
			expirationDate: expirationDate,
			enabled: true,
			last_used_ip: null,
			last_used: null
		});
		// reset form
		$scope.accountChoice = 'All accounts';
		$scope.description = '';
		$scope.expirationDate = '2015-01-01';
		$scope.mostRecentToken = generated.setup_token;
	};

	$scope.isExpired = function(token) {
		var now = new Date();
		var exp = new Date(token.expirationDate);
		return (now >= exp);
	}

	$scope.deleteToken = function(token, ev) {
		var index = $scope.tokens.indexOf(token);
		$scope.tokens.splice(index,1);
	};
});

//
// Reader-resident, a simple reader
//
app.controller('ReaderCtrl', function($scope, ReaderServer) {
	$scope.accounts = ReaderServer.getAccounts();
	$scope.setupToken = '';

	$scope.connect = function() {
		var decoded = atob($scope.setupToken);
		var parts = decoded.split('\n');
		// we ignore the url because this is just
		// a demo
		ReaderServer.addAccessToken(parts[1]);
	}
});

*/