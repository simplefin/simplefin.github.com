---
layout: default
title: SimpleFIN Protocol
link_title: Protocol
last_modified: 2016-05-09
proto_version: "1.0-draft.3"
page_classes: protocol
---

# Table of Contents #

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Introduction](#introduction)
- [SimpleFIN HTTP Protocol](#simplefin-http-protocol)
  - [Players](#players)
  - [Overview](#overview)
  - [URLS](#urls)
    - [GET /info](#get-info)
      - [Authentication](#authentication)
      - [Success response](#success-response)
    - [GET /create](#get-create)
      - [Authentication](#authentication-1)
    - [POST /claim/&lt;token&gt;](#post-claim&lttoken&gt)
      - [Authentication](#authentication-2)
      - [Response codes and content](#response-codes-and-content)
    - [GET /accounts](#get-accounts)
      - [Query parameters](#query-parameters)
      - [Authentication](#authentication-3)
      - [Response codes and content](#response-codes-and-content-1)
  - [Authentication Pieces](#authentication-pieces)
    - [Setup Token](#setup-token)
    - [Access URL](#access-url)
- [SimpleFIN Data Format](#simplefin-data-format)
  - [Organization](#organization)
  - [Account](#account)
  - [Transaction](#transaction)
  - [Account Set](#account-set)
- [Recommendations](#recommendations)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Introduction #

Last updated: {{ page.last_modified }}

Version: {{ page.proto_version }}

The SimpleFIN standard defines:

1. [SimpleFIN HTTP protocol](#simplefin-http-protocol)
2. [SimpleFIN data format](#simplefin-data-format)
3. [Recommendations for token management](#recommendations)


# SimpleFIN HTTP Protocol #

## Players ##

Institution
:   This is a bank or other institution that people have accounts with.


SimpleFIN Server
:   An HTTP server operated by the Institution.  The SimpleFIN Server **must** require SSL for all communication with both the Account Holder and the Consumer.  Connection attempts not over SSL must be dropped -- they **must not** be redirected to SSL.


Account Holder
:   This is a person (or business) that has an account with the Institution.

Consumer
:   A Consumer is an application that connects to a SimpleFIN Server to retrieve financial information pertaining to an Account Holder.  The Consumer may be a hosted service or a locally-run application.  The Consumer **only** has read access to the SimpleFIN Server.  The Consumer **can not** alter the financial data on the SimpleFIN Server in any way.


## Overview ##

1. A [Consumer](#consumer) directs an [Account Holder](#account-holder) to a [SimpleFIN Server](#simplefin-server) to obtain a [Setup Token](#setup-token).

2. The [Account Holder](#account-holder) exchanges their [Institution](#institution) credentials for a newly-generated [Setup Token](#setup-token).

3. The [Account Holder](#account-holder) gives the [Setup Token](#setup-token) to the [Consumer](#consumer).

4. The [Consumer](#consumer) gives the [Setup Token](#setup-token) to the [SimpleFIN Server](#simplefin-server) and receives an [Access URL](#access-url).

5. The [Consumer](#consumer) gets financial data from the [SimpleFIN Server](#simplefin-server) using the [Access URL](#access-url).

Step 5 is repeated as needed by the [Consumer](#consumer).


## URLS ##

The SimpleFIN Server chooses a Root Consumer URL.  The SimpleFin Server must then implement the following standard endpoints as child resources to the Root Consumer URL:


### GET /info ###

This returns a JSON document with this information:

- `versions` - An array of strings indicating the versions supported by this server.


#### Authentication

None required.


#### Success response ####

{% highlight json %}
{
  "versions": ["{{ page.proto_version }}"]
}
{% endhighlight %}


### GET /create ###

Requests to this endpoint must return a web page that will allow Account Holders to create new Setup Tokens.  The specifics are left up to the SimpleFIN Server.

#### Authentication

No SimpleFIN authentication is required.  Account Holders **should** be prompted for their Institution credentials prior to creating any Setup Tokens.



### POST /claim/&lt;token&gt; ###

Consumers use this endpoint to claim access by exchanging a [Setup Token](#setup-token) for an [Access URL](#access-url).  SimpleFIN Server's **must** only successfully respond to this endpoint for a given `token` once.

#### Authentication

No authentication is required beyond the `token` embedded in the URL.

#### Response codes and content

- `200` - A successful response will be an [Access URL](#access-url).
- `403` - Forbidden when an attempt to reuse a `token` is used or when a non-issued `token` is used.




### GET /accounts ###

Get an Account Holder's transaction data.

#### Query parameters

- `start-date` - (optional) if given, transactions will be restricted to those on or after this Unix epoch timestamp.
- `end-date` - (optional) if given, transactions will be retricted to those before (**but not on**) this Unix epoch timestamp

#### Authentication

HTTP Basic authentication using credentials in an [Access URL](#access-url).

#### Response codes and content ####

- `200` - A successful response will be a JSON-encoded [Account Set](#account-set).
- `403` - Authentication failed.



## Authentication Pieces ##

### Setup Token ###

A Setup Token is generated by the SimpleFIN Server and delivered to a Consumer by the Account Holder (via copy and paste).  It is a Base64-encoded URL of this form:

{% highlight text %}
<root_consumer_url>/claim/<token>
{% endhighlight %}

Where

- `root_consumer_url` is the SimpleFIN Server's Root Consumer URL
- `token` is a 32+ character, random string that the Consumer will provide in exchange for permanent credentials.

For instance, this URL:

{% highlight text %}
https://simplefin.example.com/claim/6e71a22a6ce9458b9897242423734d9c
{% endhighlight %}

would be encoded into a Setup Token like this:

{% highlight text %}
aHR0cHM6Ly9zaW1wbGVmaW4uZXhhbXBsZS5jb20vY2xhaW0vNmU3MWEyMmE2Y2U5NDU4Yjk4OTcy
NDI0MjM3MzRkOWM=
{% endhighlight %}


### Access URL ###

A Consumer exchanges a Setup Token for an Access URL by issuing an HTTP POST request to the URL encoded in the Setup Token.  The SimpleFIN Server will respond to the POST request with an Access URL in the body.  The Access URL will be in the following format:

{% highlight text %}
https://<id>:<key>@<root_consumer_url_without_scheme>
{% endhighlight %}

- `id` - a 32+ character, alphanumeric, random string used by the SimpleFIN Server to identify an Account Holder's accounts
- `key` - a 32+ character, alphanumeric, random string password/key.
- `root_consumer_url_without_scheme` - The SimpleFIN Server's Root Consumer URL without the scheme.  But notice that the scheme is `https:` for the Access URL.

For example:

{% highlight text %}
https://37a5706bbe944e6284220dbe03545b80:c09d3b69211c4262b911e8917da56688@simplefin.example.com
{% endhighlight %}

The SimpleFIN Server **must only** respond to this request once for a given Setup Token `token`.  Future POSTs with the same `token` **must** return 403 Forbidden.



# SimpleFIN Data Format #

- Data is encoded as JSON strings.
- All attributes are required unless otherwise noted.

These objects are defined by SimpleFIN (more details below):

- [Organization](#organization)
- [Account](#account)
- [Transaction](#transaction)
- [Account Set](#account-set)


## Organization ##

{% highlight json %}
{
  "domain": "mybank.com",
  "sfin-url": "https://sfin.mybank.com"
}
{% endhighlight %}

{% for attr in site.data.sfindata.organization.attributes %}
`{{ attr.name }}`
:   *{{ attr.type }}*
    
    {% if attr.optional %}(OPTIONAL) {% endif %}
    {{ attr.description }}
    {% for example in attr.examples %}
    - `{{ example }}`
    {% endfor %}

{% endfor %}



## Account ##

{% highlight json %}
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
  "balance-date": "2001-01-01T09:22:33.2343",
  "transactions": [
    {
      "id": "AO334",
      "posted": "1995-02-17T23:56:12.22239",
      "amount": "-33293.43",
      "description": "Uncle Frank's Bait Shop",
    }
  ]
}
{% endhighlight %}

{% for attr in site.data.sfindata.account.attributes %}
`{{ attr.name }}`
:   *{{ attr.type }}*
    
    {% if attr.optional %}(OPTIONAL) {% endif %}
    {{ attr.description }}
    {% for example in attr.examples %}
    - `{{ example }}`
    {% endfor %}

{% endfor %}



## Transaction ##
{% highlight json %}
{
  "id": "12394832938403",
  "posted": 793090572,
  "amount": "-33293.43",
  "description": "Uncle Frank's Bait Shop",
}
{% endhighlight %}

{% for attr in site.data.sfindata.transaction.attributes %}
`{{ attr.name }}`
:   *{{ attr.type }}*
    
    {% if attr.optional %}(OPTIONAL) {% endif %}
    {{ attr.description }}
    {% for example in attr.examples %}
    - `{{ example }}`
    {% endfor %}

{% endfor %}


## Account Set ##
{% highlight json %}
{
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
{% endhighlight %}

{% for attr in site.data.sfindata.accountset.attributes %}
`{{ attr.name }}`
:   *{{ attr.type }}*
    
    {% if attr.optional %}(OPTIONAL) {% endif %}
    {{ attr.description }}
    {% for example in attr.examples %}
    - `{{ example }}`
    {% endfor %}

{% endfor %}


# Recommendations #

It is *recommended* that Account Holders have the following abilities regarding Access Token management:

1. Users can associate user-provided names with tokens (e.g. "This is the token being used by example.com").
2. Users can create many tokens (for providing to multiple third party services).
3. Users can choose an expiration date for tokens when creating them.
4. Users can manually invalidate/expire existing tokens at will.  This is useful in the case of stolen tokens or abuse by third parties to whom tokens were given.

Additionally, consider the following when implementing a token management system:

1. It may be nice to notify users prior to token expiration.
2. It may be nice to allow users to temporarily disable all tokens and later re-enable them.  This can be used to prevent access while doing research into abuse.
3. Consider providing logging/audit information regarding token use, including the time tokens were used and the IPs from which requests came.
4. Allow tokens to be associated with a subset of available accounts.  For instance, allow the user to create one token for access to just their checking account, and another token for access to just their savings account.


<script src="/js/anchor.min.js"></script>
<script>
/**
 * AnchorJS v1.1.1 options and selector
 */

(function () {
  'use strict';

  anchors.options.placement = 'right';

  anchors.add('h1, h2, h3, h4, h5, h6, dt');

})();
</script>
