---
layout: default
title: SimpleFIN Protocol
last_modified: 2015-06-22
---


Last updated: {{ page.last_modified }}

Version: 1.0-draft

The SimpleFIN standard defines:

1. [SimpleFIN HTTP protocol](#http-protocol)
2. [SimpleFIN data format](#data-format)
3. [Recommendations for token management](#recommendations)


## <a name="http-protocol"></a>HTTP Protocol ##

## Players ##

<dl>
  <dt>{{ anchor('the-company') }}The Company</dt>
  <dd>
    This is a bank or other institution that people have accounts with.
  </dd>
  <dt>{{ anchor('server') }}Server</dt>
  <dd>
    An HTTP server operated by <span class="term">The Company</span>.  The <span class="term">Server</span> must require SSL for all communication with both the <span class="term">Browser</span> and the <span class="term">Reader</span>.  Connection attempts not
    over SSL must be dropped -- they must not be redirected to SSL.
  </dd>
  <dt>{{ anchor('account-holder') }}Account holder</dt>
  <dd>
    This is a person (or business) that has an account with <span class="term">The Company</span>.
  </dd>
  <dt>{{ anchor('browser') }}Browser</dt>
  <dd>
    A web browser being used by an <span class="term">Account holder</span>.
  </dd>
  <dt>{{ anchor('reader') }}Reader</dt>
  <dd>
    A <span class="term">Reader</span> is a piece of software that connects to a <span class="term">Server</span> to retrieve financial information pertaining to an <span class="term">Account holder</span>.  The <span class="term">Reader</span> may be a web app or a locally-run application.  The <span class="term">Reader</span> <strong>only</strong> has read access to the <span class="term">Server</span>.  The <span class="term">Reader</span> <strong>can not</strong> alter the financial data on the <span class="term">Server</span> in any way.
  </dd>
</dl>
