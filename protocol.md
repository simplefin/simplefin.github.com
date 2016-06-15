

# Introduction

The SimpleFIN protocol allows users to share read-only financial data with third parties.

# HTTP Endpoints

<section>

<div class="main">
A SimpleFIN Server has a root URL.  All the resources below are relative to this root URL.
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

## Start connecting

<section>

<div class="main">
An application directs a user to this URL to initiate connecting.

### HTTP Request

`GET /create`

### Response HTML

The response is a web page that:

1. Authenticates the user
2. Guides the user to create a SimpleFIN Token

</div>

<div class="example">
For example, an application that wants to access a user's transaction data could present the following in a web page:

~~~{.html}
To connect your bank to this application,
<a href="https://bridge.simplefin.org/simplefin/create">click here</a>
~~~
</div>

</section>


## Claim access

<section>

<div class="main">
    
</div>

<div class="example">
    
</div>

</section>



# Guides


## Application Developers

## Banks/Providers


More words.
