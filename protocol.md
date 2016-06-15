
<img src="img/logo.svg" style="width: 32px; height: 32px;" align="center"> SimpleFIN Protocol

- Version: 1.0-draft.4
- Last modified: 15 Jun 2016

# Introduction

The SimpleFIN protocol allows users to share read-only financial data with third parties.  It's similar to RSS for financial data.

Three parties are involved in SimpleFIN:

| Party | Description |
|---|---|
| User | A person using a web browser.  They have an account at a bank or other institution. |
| Application | Third party software that wants read-only access to a *User*'s financial data. |
| Server | A SimpleFIN Server operated by a bank or other financial institution. |

Users should visit the [SimpleFIN Bridge](https://bridge.simplefin.org).

Application developers should start with the [App Quickstart](#app-quickstart).

Banks/Financial Institutions wanting to host their own SimpleFIN Server should start at the [TODO: Server Implementation Guide](#server-implementation-guide).



## SimpleFIN Bridge

For optimal privacy, banks ought to implement SimpleFIN Servers.  In some cases, where banks haven't yet implemented SimpleFIN, the [SimpleFIN Bridge](https://bridge.simplefin.org) can be used.

# App Quickstart

This guide is for application developers that want to integrate financial data (bank account balances/transactions) into their application.

If you are a programmer, and want programmatic access to your financial data, you're in the right place.

## 1. Start a connection

<section>

<div class="main">
First, direct your user to create a SimpleFIN Token.  Do this by sending them to their institution's SimpleFIN Server `/create` URL.  If you don't have that, you can use the [SimpleFIN Bridge](https://bridge.simplefin.org/simplefin/create).
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

Make a POST request to the decoded URL to get an Access Key:

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

See [Get account data](#get-account-data) for more information.

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


# Data

## Account Set

<section>

<div class="main">

| Attribute | Type | Required | Description |
|---|---|---|---|
| errors | array | **yes** | Array of strings suitable for displaying to a user. |
| accounts | array of [Accounts](#accounts) | **yes** | List of accounts. |

<warning>
Though the array of strings are meant for users, you **must** sanitize the strings when displaying them (to prevent Cross-Site Scripting or other attacks).
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
| currency | string | **yes** | If the currency is a standard currency, this is the currency code from the official ISO 4217.  For example `"ZMW"` or `"USD"`. |
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





## Transaction

<section>

<div class="main">


| Attribute | Type | Required | Description |
|---|---|---|---|
| id | string | **yes** | An ID that uniquely describes a transaction within an Account. An organization may reuse transaction ids for different accounts, but may never reuse a transaction id within an account. |
| posted | UNIX epoch timestamp | **yes** | This is when the transaction happened. |
| amount | numeric string | **yes** | Amount of transaction. Positive numbers indicate money being deposited into the account. |
| description | string | **yes** | A human-readable description of what the transaction was for. |
| extra | object | optional | This optional attribute may be used to include extra transaction-specific data that is not defined in this standard. It is up to the Server to decide whether or not to include data in here. |

</div>

<div class="example">

~~~{.json}
{
  "id": "12394832938403",
  "posted": 793090572,
  "amount": "-33293.43",
  "description": "Uncle Frank's Bait Shop",
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

**Note:** Either `domain` or `name` is required.

| Attribute | Type | Required | Description |
|---|---|---|---|
| domain | string | maybe | Domain name of the financial institution. |
| sfin-url | string | **yes** | Root URL of organization's SimpleFIN Server |
| name | string | maybe | Human-friendly name of the financial institution. |

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

Following are all 4 the endpoints a SimpleFIN Server must implement.

- [`GET /info`](#server-info)
- [`GET /create`](#create-simplefin-token)
- [`POST /claim/:token`](#claim-access-key)
- [`GET /accounts`](#get-account-data)

</div>

<div class="example">
Here's an example root URL, set to the shell environment variable `ROOT`.

~~~{.bash}
ROOT="https://bridge.simplefin.org/simplefin"
~~~
</div>

</section>


## Server Info

<section>

<div class="main">
Find out what versions of the SimpleFIN Protocol the server supports.

### HTTP Request

`GET /info`

### Response JSON

| Attribute | Description |
|---|---|
| versions | An array of version strings that this server supports. |

</div>

<div class="example">

Request:

~~~{.bash}
curl https://bridge.simplefin.org/simplefin/info
~~~

Response:

~~~{.json}
{
    "versions": ["1.0-draft"],
}
~~~
</div>


</section>

## Create SimpleFIN Token

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


## Claim Access Key

<section>

<div class="main">

An application receives a SimpleFIN Token from a user.  SimpleFIN Tokens are Base64-encoded URLs.  A decoded SimpleFIN Token will point to this resource.

### HTTP Request

`POST /claim/:token`

| Parameter | Description |
|---|---|
| :token | A one-time use code embedded within the SimpleFIN Token. |

### Successful response body

Response is an Access Key, which is just a URL with included Basic Auth credentials.

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

Claim the Access Key associated with this SimpleFIN Token:

~~~{.bash}
ACCESS_KEY=$(curl -X POST "${DECODED_TOKEN}")
# https://demo:demo@bridge.simplefin.org/simplefin
~~~


</div>

</section>


## Get account data


<section>

<div class="main">
Retrieve account and transaction data.

### HTTP Request

`GET /accounts`

| Parameter | Required | Description |
|---|---|---|
| start-date | optional | If given, transactions will be restricted to those on or after this Unix epoch timestamp. |
| end-date | optional | If given, transactions will be restricted to those before (**but not on**) this Unix epoch timestamp. |

### Authentication

HTTP Basic Authentication using credentials obtained from the [Claim Access Key](#claim-access-key) endpoint are used.

### Successful response

A successful response will be a JSON [Account Set](#account-set).

### Responses

| Code | Description |
|---|---|
| 200 | Successful response |
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

## Server Implementation Guide

TODO