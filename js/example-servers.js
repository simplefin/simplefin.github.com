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
		var bank = LocalStorage.get('bank-data');
		var accounts = [];
		// find matching tokens
		angular.forEach(bank.tokens, function(bank_token) {
			if (bank_token.hash == token && bank_token.enabled) {
				// match
				angular.forEach(bank_token.accounts, function(account) {
					if (accounts.indexOf(account) == -1) {
						accounts.push(account);
					}
				});
			}
		});
		
		var ret_accounts = accounts.map(function(account_name) {
			return bank.accounts.filter(function(bank_account) {
				return bank_account.name == account_name;
			})[0];
		});
		return ret_accounts;
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

bank_app.factory('Server', function($rootScope, LocalStorage) {
	this.data = {
		sfin_url: 'https://www.example.com/sfin',
		accounts: [],
		tokens: []
	};

	this.load = function() {
		var data = LocalStorage.get('bank-data');
		if (data == null) {
			data = {
				accounts: [
					{name: 'Checking', number: '1238394', balance:'12.50', simplefin_id: 'SFIN-9000002'},
					{name: 'Savings', number: '28398403', balance:'18.90', simplefin_id: 'SFIN-8840034'},
				],
				tokens: []
			};
		}
		angular.extend(this.data, data);
	}
	this.load();

	this.save = function() {
		LocalStorage.put('bank-data', this.data);
	};

	$rootScope.$watch(function() {
		return this.data;
	}.bind(this), function() {
		this.save();
	}.bind(this), true);

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
	};
	return this;
});

bank_app.controller('BankCtrl', function($scope, LocalStorage, Server) {
	$scope.accounts = Server.data.accounts;
	$scope.tokens = Server.data.tokens;
	$scope.current_token = null;

	$scope.startOver = function() {
		LocalStorage.clear();
		window.location = 'fakeaccountant.html';
	};

	$scope.deleteToken = function(token) {
		$scope.tokens.splice($scope.tokens.indexOf(token), 1);
	}

	$scope.generateToken = function() {
		var accounts = [];
		angular.forEach($scope.accounts, function(account) {
			accounts.push(account.name);
		});
		var generated = Server.generateSetupToken();
		var expiration = new Date();
		expiration.setMonth(expiration.getMonth() + 12);

		$scope.current_token = {
			hash: generated.hash,
			sfin_url: generated.sfin_url,
			accounts: accounts,
			setup_token: generated.setup_token,
			name: '',
			expiration: expiration,
			enabled: true
		};
		$scope.tokens.push($scope.current_token);
	};

	if ($scope.current_token == null) {
		$scope.generateToken();
	}
});
