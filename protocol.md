
<img src="img/logo.svg" style="width: 32px; height: 32px;" align="center"> SimpleFIN Protocol

- Version: VERSIONTAG-draft

# Introduction

The SimpleFIN protocol allows users to share read-only financial data with third parties.  It's similar to RSS, but for financial data.

Though intended mostly for banks, it can also be used for reward points or gift certificate balances (e.g. Frequent Flyer Miles, Amazon gift card balance, etc...)

Three parties are involved in SimpleFIN:

| Party | Description |
|---|---|
| User | A person using a web browser.  They have an account at a bank or other institution. |
| Application | Third party software that wants read-only access to a *User*'s financial data. |
| Server | A SimpleFIN Server operated by a bank or other financial institution. |

Application developers should start with the [App Quickstart](#app-quickstart).

Banks or financial institutions wanting to host their own SimpleFIN Server should start at the [Server Implementation Guide](#server-implementation-guide).

Users should visit the [SimpleFIN Bridge](https://bridge.simplefin.org).


## Flow

This diagram shows how a User gives read-only bank account access to an App:

![](img/connect-flow.svg)

And this diagram shows how a User can revoke an App's access:

![](img/revoke-flow.svg)


## SimpleFIN Bridge

For optimal privacy, banks ought to implement SimpleFIN Servers.  In some cases, where banks haven't yet implemented SimpleFIN, the [SimpleFIN Bridge](https://bridge.simplefin.org) can be used.



# App Quickstart

This section is for application developers that want to integrate financial data (bank account balances/transactions) into their application.

If you are a programmer, and want programmatic access to your financial data, you're in the right place.

## 1. Start a connection

<section>

<div class="main">
First, direct your user to create a SimpleFIN Token.  Do this by sending them to their institution's SimpleFIN Server `/create` URL.  If their institution doesn't have a SimpleFIN Server, you can use the [SimpleFIN Bridge](https://bridge.simplefin.org/simplefin/create).
</div>

<div class="example">
Here's an example HTML snippet:

~~~{.html}
Connect your bank account to this app, by
<a href="https://bridge.simplefin.org/simplefin/create">clicking here.</a>
~~~

</div>

</section>

## 2. Receive a SimpleFIN Token

<section>

<div class="main">
The user will return to your app with a SimpleFIN Token in their clipboard.  Provide a location for them to paste the token into your app -- perhaps on the same page they left from.
</div>

<div class="example">

Here's an example HTML form that receives a SimpleFIN Token:

~~~{.html}
<form method="post">
    SimpleFIN Token: <textarea name="token"></textarea>
    <button type="submit">Connect Bank</button>
</form>
~~~

</div>

</section>

## 3. Claim the Access URL

<section>

<div class="main">
The SimpleFIN Token you receive from users is a Base64-encoded URL.  Make an HTTP POST to that URL to claim an Access URL.

Securely store the Access URL for later use.

</div>

<div class="example">

Here's a command line example.  Obtain a SimpleFIN Token:

~~~{.bash}
SIMPLEFIN_TOKEN="aHR0cHM6Ly9icmlkZ2Uuc2ltcGxlZmluLm9yZy9zaW1wbGVmaW4vY2xhaW0vZGVtbw=="
~~~

Base64 decode the SimpleFIN Token to get a URL:

~~~{.bash}
CLAIM_URL=$(echo "${SIMPLEFIN_TOKEN}" | base64 --decode)
# https://bridge.simplefin.org/simplefin/claim/demo
~~~

Make a POST request to the decoded URL to get an Access URL:

~~~{.bash}
ACCESS_URL=$(curl -X POST "${CLAIM_URL}")
# https://user123:pass456@bridge.simplefin.org/simplefin
~~~

</div>

</section>

## 4. Get Data

<section>

<div class="main">

Issue GET requests to the Access URL's `/accounts` resource to get account and transaction information.

Successful responses will be a JSON [Account Set](#account-set).

See [GET /accounts](#get-accounts) for more information.

</div>

<div class="example">

Request:

~~~{.bash}
curl "${ACCESS_URL}/accounts"
~~~

Sample response:

~~~{.json}
{
  "errors": ["You must reauthenticate."],
  "accounts": [
    {
      "org": {
        "domain": "mybank.com",
        "sfin-url": "https://sfin.mybank.com"
      },
      "id": "2930002",
      "name": "Savings",
      "currency": "USD",
      "balance": "100.23",
      "available-balance": "75.23",
      "balance-date": 978366153,
      "transactions": []
    }
  ]
}
~~~

</div>

</section>


## Checklist

<section>

<div class="main">

The following checklists can help make sure your SimpleFIN-capable application is implemented correctly:

### Required

The application:

1. Handles a 403 response when claiming an Access URL.
1. When claiming an Access URL fails, notifies the customer that the token may be compromised so they can disable the token.
1. Only makes requests to SSL/TLS URLs (i.e. HTTPS and never HTTP).
1. Stores Access URLs at least as securely as the user's financial data.
1. Handles a 403 response from `/accounts`.
1. Displays error messages from `/accounts` to the user.
1. Sanitizes all error messages from `/accounts` that are displayed to the user.
1. Verifies all SSL/TLS certificates when making HTTPS requests.

### Recommended

The application:

1. Handles [custom currencies](#custom-currencies).



</div>
</section>

# Data

## Account Set

<section>

<div class="main">

| Attribute | Type | Required | Description |
|---|---|---|---|
| errors | array | **yes** | Array of strings suitable for displaying to a user. |
| accounts | array of [Accounts](#accounts) | **yes** | List of accounts. |

<warning>
Though the array of strings are meant for users, you **must** sanitize the strings when displaying them.
</warning>

</div>

<div class="example">

~~~{.json}
{
  "errors": [],
  "accounts": [
    {
      "org": {
        "domain": "mybank.com",
        "sfin-url": "https://sfin.mybank.com"
      },
      "id": "2930002",
      "name": "Savings",
      "currency": "USD",
      "balance": "100.23",
      "available-balance": "75.23",
      "balance-date": 978366153,
      "transactions": [
        {
          "id": "12394832938403",
          "posted": 793090572,
          "amount": "-33293.43",
          "description": "Uncle Frank's Bait Shop",
        }
      ],
      "extra": {
        "account-open-date": 978360153,
      }
    }
  ]
}
~~~

</div>
</section>


## Account

<section>

<div class="main">

| Attribute | Type | Required | Description |
|---|---|---|---|
| org | [Organization](#organization) | **yes** | Organization from which this account originates. |
| id | string | **yes** | String that uniquely identifies the account within the organization.  It is recommended that this id be chosen such that it does not reveal any sensitive data (login information for the bank's web banking portal, for instance). |
| name | string | **yes** | A name that uniquely describes an account among all the users other accounts. This name should be chosen so that a person can easily associate it with only one of their accounts within an organization. |
| currency | string | **yes** | If the currency is a standard currency, this is the currency code from the official ISO 4217.  For example `"ZMW"` or `"USD"`.  If this is a custom currency, see the [Custom Currencies section](#custom-currencies) below. |
| balance | numeric string | **yes** | The balance of the account as of `balance-date`. |
| available-balance | numeric string | optional | The available balance of the account as of balance-date. This may be omitted if it is the same as balance. |
| balance-date | UNIX epoch timestamp | **yes** | The timestamp when the balance and available-balance became what they are. |
| transactions | array of [Transactions](#transaction) | optional | List of a subset of [Transactions](#transaction) for this account, ordered by `posted`. |
| extra | object | optional | This optional attribute may be used to include extra account-specific data that is not defined in this standard. It is up to the Server to decide whether or not to include data in here. |

</div>

<div class="example">

~~~{.json}
{
  "org": {
    "domain": "mybank.com",
    "sfin-url": "https://sfin.mybank.com"
  },
  "id": "2930002",
  "name": "Savings",
  "currency": "USD",
  "balance": "100.23",
  "available-balance": "75.23",
  "balance-date": 978366153,
  "transactions": [
    {
      "id": "12394832938403",
      "posted": 793090572,
      "amount": "-33293.43",
      "description": "Uncle Frank's Bait Shop",
    }
  ],
  "extra": {
    "account-open-date": 978360153,
  }
}
~~~

</div>

</section>

### Custom Currencies

<section>

<div class="main">

SimpleFIN supports custom currencies such as: Frequent Flyer Miles, Rewards Points, brownie points, etc...

Custom currencies are identified by a unique URL.  When an HTTP GET request is made to the URL, it should return a JSON object with the following attributes:

| Attribute | Type | Required | Description |
|---|---|---|---|
| name | string | **yes** | Human-readable name of the currency. |
| abbr | string | **yes** | Human-readable short name of the currency. |

<warning>
All strings obtained from these requests **must** be sanitized when displaying them to users.
</warning>

</div>

<div class="example">

The following Account's currency is `https://www.example.com/fake-currency`

~~~{.json}
{
  ...
  "id": "2930002",
  "name": "Savings",
  "currency": "https://www.example.com/flight-miles",
  "balance": "100.23",
  "available-balance": "75.23",
  "balance-date": 978366153,
  "transactions": []
}
~~~

Making a request to the currency URL:

~~~{.bash}
curl https://www.example.com/flight-miles
~~~

Returns the following:

~~~{.json}
{
  "name": "Example Airline Miles",
  "abbr": "miles"
}
~~~

</div>

</section>




## Transaction

<section>

<div class="main">


| Attribute | Type | Required | Description |
|---|---|---|---|
| id | string | **yes** | An ID that uniquely describes a transaction within an Account. An organization may reuse transaction ids for different accounts, but may never reuse a transaction id within an account. |
| posted | UNIX epoch timestamp | **yes** | This is when the transaction posted to the account. If the transaction is pending, this may be `0`. |
| amount | numeric string | **yes** | Amount of transaction. Positive numbers indicate money being deposited into the account. |
| description | string | **yes** | A human-readable description of what the transaction was for. |
| transacted_at | UNIX epoch timestamp | optional | This is when the transaction happened. |
| pending | boolean | optional | `true` indicates that this transaction has not yet posted. Default is `false` (or absent), meaning the transaction has posted. |
| extra | object | optional | This optional attribute may be used to include extra transaction-specific data that is not defined in this standard. It is up to the Server to decide whether or not to include data in here. |

</div>

<div class="example">

~~~{.json}
{
  "id": "12394832938403",
  "posted": 793090572,
  "amount": "-33293.43",
  "description": "Uncle Frank's Bait Shop",
  "pending": true,
  "extra": {
    "category": "food"
  }
}
~~~

</div>

</section>



## Organization

<section>

<div class="main">

<note>
Either `domain` or `name` is required.  Both may be specified.
</note>

| Attribute | Type | Required | Description |
|---|---|---|---|
| domain | string | maybe | Domain name of the financial institution. |
| sfin-url | string | **yes** | Root URL of organization's SimpleFIN Server |
| name | string | maybe | Human-friendly name of the financial institution. |
| url | string | no | Optional URL of financial institution |
| id | string | no | Optional ID for the financial institution. The ID must be unique per SimpleFIN server, but it is not guaranteed that IDs are globally unique. Prefer `domain` as a globally unique ID for each institution |

</div>

<div class="example">

~~~{.json}
"org": {
  "domain": "mybank.com",
  "name": "My Bank",
  "sfin-url": "https://sfin.mybank.com"
}
~~~

</div>

</section>


# HTTP Endpoints

<section>

<div class="main">
A SimpleFIN Server has a root URL.  All the resources below are relative to this root URL.

Following are all 4 HTTP endpoints a SimpleFIN Server must implement.

- [`GET /info`](#get-info)
- [`GET /create`](#get-create)
- [`POST /claim/:token`](#post-claimtoken)
- [`GET /accounts`](#get-accounts)

</div>

<div class="example">
Here's an example root URL, set to the shell environment variable `ROOT`.

~~~{.bash}
ROOT="https://bridge.simplefin.org/simplefin"
~~~
</div>

</section>


## GET /info

<section>

<div class="main">

Used by Applications to find out what versions of the SimpleFIN Protocol the server supports. The strings returned must be in `MAJOR.MINOR.FIX` or `MAJOR.MINOR` format.

Note: as this specification is still in draft, most servers will report `1.0` but may not yet support all things from the draft specification.

### HTTP Request

`GET /info`

### Response JSON

| Attribute | Description |
|---|---|
| versions | An array of version string prefixes that this server supports. |

</div>

<div class="example">

Request:

~~~{.bash}
curl https://bridge.simplefin.org/simplefin/info
~~~

Response:

~~~{.json}
{
    "versions": ["1.0"],
}
~~~
</div>


</section>

## GET /create

<section>

<div class="main">
An application directs a user to this URL to initiate a bank-app connection.  When a user visits this URL the server:

1. Authenticates the user
2. Guides the user to create a SimpleFIN Token.
3. Tells the user to give the SimpleFIN Token to the application requesting it.

This process could happen all at once with a single response (if the user is already authenticated) or it could be more involved.  Either way, the end result is a copyable SimpleFIN Token.

### HTTP Request

`GET /create`



</div>

<div class="example">
For example, an application that wants to access a user's transaction data could present the following in a web page:

~~~{.html}
To connect your bank to this application,
<a href="https://bridge.simplefin.org/simplefin/create">click here</a>
~~~

An example SimpleFIN Token looks like this:

~~~
aHR0cHM6Ly9icmlkZ2Uuc2ltcGxlZmluLm9yZy9zaW1wbGVmaW4vY2xhaW0vZGVtbw==
~~~

</div>

</section>


## POST /claim/:token

<section>

<div class="main">
An application receives a SimpleFIN Token from a user.  SimpleFIN Tokens are Base64-encoded URLs.  A decoded SimpleFIN Token will point to this resource.

### HTTP Request

`POST /claim/:token`

| Parameter | Description |
|---|---|
| :token | A one-time use code embedded within the SimpleFIN Token. |

### Successful response body

Response is an Access URL, which is just a URL with included Basic Auth credentials.

### Responses

| Code | Description |
|---|---|
| 200 | Successful response |
| 403 | The claim token either does not exist or has already been used claimed by someone else.  Receiving this could mean that the user's transaction information has been compromised. |

    
</div>

<div class="example">

The following example uses a demo token that can be reused:

~~~{.bash}
TOKEN="aHR0cHM6Ly9icmlkZ2Uuc2ltcGxlZmluLm9yZy9zaW1wbGVmaW4vY2xhaW0vZGVtbw=="
~~~

Decode the token:

~~~{.bash}
DECODED_TOKEN=$(echo "${TOKEN}" | base64 -D)
~~~

Claim the Access URL associated with this SimpleFIN Token:

~~~{.bash}
ACCESS_URL=$(curl -X POST "${DECODED_TOKEN}")
# https://demo:demo@bridge.simplefin.org/simplefin
~~~


</div>

</section>


## GET /accounts


<section>

<div class="main">
Retrieve account and transaction data.

### HTTP Request

`GET /accounts`

| Parameter | Required | Description |
|---|---|---|
| start-date | optional | If given, transactions will be restricted to those on or after this Unix epoch timestamp. |
| end-date | optional | If given, transactions will be restricted to those before (**but not on**) this Unix epoch timestamp. |
| pending | optional | If `pending=1` is provided, pending transactions will be included (if supported). By default, pending transaction are **NOT** included. |
| account | optional | If given, only return information related to the given account id. May be specified multiple times. |
| balances-only | optional | If `balances-only=1` is provided, no transaction data is returned. |

### Authentication

HTTP Basic Authentication using credentials obtained from the [POST /claim/:token](#post-claimtoken) endpoint are used.

### Successful response

A successful response will be a JSON [Account Set](#account-set).

### Responses

| Code | Description |
|---|---|
| 200 | Successful response |
| 402 | Payment required |
| 403 | Authentication failed.  This could be because access has been revoked or if the credentials are incorrect. |

</div>

<div class="example">
Request:

~~~{.bash}
curl "https://demo:demo@bridge.simplefin.org/simplefin/accounts?start-date=978360153"
~~~

Sample response:

~~~{.json}
{
  "errors": [],
  "accounts": [
    {
      "org": {
        "domain": "mybank.com",
        "sfin-url": "https://sfin.mybank.com"
      },
      "id": "2930002",
      "name": "Savings",
      "currency": "USD",
      "balance": "100.23",
      "available-balance": "75.23",
      "balance-date": 978366153,
      "transactions": []
    }
  ]
}
~~~

</div>
</section>
