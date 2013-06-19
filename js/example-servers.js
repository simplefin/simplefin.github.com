var common = angular.module('common', []);

common.factory('LocalStorage', function() {
	this.put = function(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
	}
	this.get = function(key) {
		return JSON.parse(localStorage.getItem(key));
	}
	this.clear = function() {
		localStorage.clear();
	}
	return this;
});

//-----------------------------------------------------------------------------
// Accountant
//-----------------------------------------------------------------------------
var accountant_app = angular.module('accountant', ['common']);

accountant_app.run(function($templateCache) {
	var template_names = ['index.html', 'accounts.html'];
	template_names.forEach(function(name) {
		var tag = document.getElementById(name);
		$templateCache.put(name, tag.innerHTML);
	});
})

accountant_app.config(function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(false).hashPrefix('');

	$routeProvider
	.when('/', {
		templateUrl: 'index.html',
		controller: 'IndexCtrl'
	})
	.when('/accounts', {
		templateUrl: 'accounts.html',
		controller: 'AccountsCtrl'
	})
	.otherwise({
		redirectTo: '/'
	});
});


// "Remote" access to Bank server
accountant_app.service('RemoteServer', function(LocalStorage) {
	// This simulates requesting from the remote server.
	this.dataForToken = function(token) {
		// "Request" new account information for the tokens we have.
		var bank_tokens = LocalStorage.get('bank-tokens');
		var bank_accounts = LocalStorage.get('bank-accounts');
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
					ret_accounts.push(bank_account);
				}
			});
			return ret_accounts;
		}
	}
	return this;
})

accountant_app.service('Server', function($rootScope, LocalStorage, RemoteServer) {
	this.data = {}

	this.load = function() {
		var data = LocalStorage.get('reader-data');
		if (data == null) {
			data = {
				accounts: [],
				tokens: []
			};
		}
		angular.extend(this.data, data);
	};
	this.load();

	$rootScope.$watch(function() {
		return this.data;
	}.bind(this), function() {
		this.save();
	}.bind(this), true)

	this.save = function() {
		LocalStorage.put('reader-data', this.data);
	};

	$rootScope.$watch(function() {
		return this.data.tokens;
	}.bind(this), function() {
		this.data.accounts.length = 0;
		angular.forEach(this.data.tokens, function(token) {
			var data = RemoteServer.dataForToken(token);
			angular.forEach(data, function(datum) {
				this.data.accounts.push(datum);
			}.bind(this));
		}.bind(this));
	}.bind(this), true)
});

accountant_app.controller('IndexCtrl', function($scope, $location, LocalStorage, Server) {
	$scope.trans = {
		pastedToken: ''
	};
	$scope.tokens = Server.data.tokens;
	$scope.accounts = Server.data.accounts;

	$scope.$watch('trans.pastedToken', function(value) {
		// try decoding it.
		if (!value.length) {
			return;
		}
		try {
			var decoded = atob(value);
			var parts = decoded.split('\n');
			var url = parts[0];
			var access_token = parts[1];
			if (access_token != null) {
				$scope.tokens.push(access_token);
			}
			$scope.pastedToken = '';
			$location.path('/accounts');
		} catch(err) {
		}
	});
});

accountant_app.controller('AccountsCtrl', function($scope, Server) {
	$scope.accounts = Server.data.accounts;
});

accountant_app.controller('GlobalCtrl', function($scope, $location, $timeout, Server, LocalStorage) {
	$scope.accounts = Server.data.accounts;
	$scope.path = $location.path();
	$scope.$watch(function() {
		return $location.path();
	}, function(value) {
		$scope.path = value;
	})

	$scope.startOver = function() {
		LocalStorage.clear();
		$location.path('/');
		$timeout(function() {
			window.location.reload();
		}, 100);
	};
});



//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
// Bank
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
//-----------------------------------------------------------------------------
var bank_app = angular.module('bank', ['common']);

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
		window.location = 'fakeaccountant.html';
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
