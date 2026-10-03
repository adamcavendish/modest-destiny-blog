+++
title = "The Token That Cannot Tell You Who Holds It"
date = 2026-10-03
description = "A bearer token can authorize a request without telling the API which client is making it."
taxonomies = { tags = ["OAuth", "Security", "DPoP"], series = ["Proof-Carrying HTTP: Understanding DPoP"] }

[extra]
series_order = 1
article_scripts = ["js/articles/dpop-replay.js"]
+++

At 09:17, a support engineer searches a gateway log for a failed profile request. The line contains a familiar header:

```http
Authorization: Bearer eyJhbGciOi...
```

At 09:19, the same string appears in a request from a machine in another region. The API accepts it. Nothing in the token tells the API that the second request came from a different process, a different device, or a different person.

{{ <dpop_figure src="images/dpop/01-bearer-replay.svg" alt="A client sends a bearer token through a gateway to an API while an observer copies the token and replays it." caption="A copied bearer token is indistinguishable from the original at the authorization boundary." /> }}

<div class="dpop-motion" data-anime-demo="dpop-replay" aria-label="A static explanation of bearer-token replay">
  <div class="dpop-motion__rail"><span class="dpop-motion__node">client</span><span class="dpop-motion__arrow" aria-hidden="true">→</span><span class="dpop-motion__node">gateway</span><span class="dpop-motion__arrow" aria-hidden="true">→</span><span class="dpop-motion__node">API</span></div>
  <div class="dpop-motion__stage" aria-hidden="true"><span class="dpop-motion__endpoint">copied token</span><span class="dpop-motion__track"></span><span class="dpop-motion__endpoint dpop-motion__endpoint--target">accepted</span><span class="dpop-motion__token">Bearer token</span></div>
  <p class="dpop-motion__caption">The duplicate is valid because possession is the rule.</p>
  <button class="dpop-motion__replay-button" type="button" data-anime-replay>Replay animation</button>
</div>

## What a bearer token actually says

OAuth separates two questions that are easy to blend together:

- **Authorization:** what may this client do?
- **Authentication of the request sender:** which party is making this request?

A bearer access token answers the first question. It usually does not answer the second. The resource server validates the token's issuer, audience, scope, and lifetime, then treats the presenter as authorized if those checks pass.

That behavior is not a flaw hidden in an implementation. It is the definition of a bearer credential: possession is enough to use it.

## Why copying is realistic

The token does not have to be stolen from the wire. A browser extension, a verbose proxy, a crash report, a support bundle, or a log sink may see the header after TLS has already done its job. A compromised application can read its own memory. A token that is short-lived and carefully scoped is safer, but it is still a bearer token while it is valid.

The important distinction is between **protecting transit** and **constraining use**. TLS protects the channel between two endpoints. It does not attach a cryptographic identity to the token that survives a later copy.

## Why the blast radius matters

A copied token can be replayed against every resource server that accepts it, subject to its audience and scope. In a distributed system, that can mean several gateways, regional APIs, and asynchronous workers all need to notice the same misuse. Revocation helps, but it introduces propagation delay and operational cost; waiting for expiry leaves a window open.

The problem is most visible when a token outlives the process that obtained it. A mobile app may hand a request to a networking library, a gateway may record metadata for debugging, and an API may forward the token internally. Every boundary is a place where possession can be separated from the original client.

## The question DPoP changes

DPoP asks the server to require a second piece of evidence: not only “is this access token acceptable?” but also “does the caller control the key to which this token was bound?”

That is a narrower promise than “the client is trustworthy.” An attacker who can drive the legitimate client and its key may still make fresh requests. DPoP is aimed at the copied-token replay in our opening scene: a string that escaped without the private key that gives it a sender constraint.

The next post will keep the same request on the screen and add the missing object—a proof that travels with it.

## References

- [RFC 6749: The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749)
- [RFC 6750: The OAuth 2.0 Authorization Framework: Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750)
- [RFC 9449: OAuth 2.0 Demonstrating Proof of Possession at the Application Layer (DPoP)](https://www.rfc-editor.org/rfc/rfc9449)
