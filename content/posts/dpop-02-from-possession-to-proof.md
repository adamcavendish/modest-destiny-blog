+++
title = "From Possession to Proof"
date = 2026-10-03
description = "DPoP binds an access token to a key and asks the client to sign a fresh description of each request."
taxonomies = { tags = ["OAuth", "Security", "DPoP"], series = ["Proof-Carrying HTTP: Understanding DPoP"] }

[extra]
series_order = 2
+++

The first post ended with a stolen string that still worked. The repair begins by giving the client something the string cannot carry away: a private key.

A DPoP client creates a key pair. The private key stays inside the client; the public key can be represented in a JSON Web Key and summarized by a thumbprint. The authorization server binds the access token to that thumbprint, usually in a confirmation claim named `cnf.jkt`.

{{ <dpop_figure src="images/dpop/02-proof-boundary.svg" alt="A private key remains inside the client while a public-key thumbprint binds the access token and a signed proof travels with the request." caption="The token carries authorization; the proof carries evidence of control over the bound key." /> }}

## Two artifacts, two jobs

The access token still answers the authorization question. It can say that this client may read a profile, call a payment API, or use a particular scope until a particular time.

The DPoP proof answers a different question: did the holder of the bound private key sign this particular request? The proof is a short-lived JWT sent in the `DPoP` header, alongside an `Authorization: DPoP ...` access-token header.

A proof claim set looks like this when we remove the signatures and encoding:

```json
{
  "jti": "one-unique-proof-id",
  "htm": "GET",
  "htu": "https://api.example.test/v1/profile",
  "iat": 1791024000,
  "ath": "sha256-of-the-access-token"
}
```

`htm` and `htu` bind the proof to the method and target URI. `iat` gives the verifier a freshness window. `jti` gives the proof an identity that can be rejected if it appears again. `ath` binds the proof to the exact access token being presented.

## A signature is not yet a protocol

The private key signing bytes is the easy part. The protocol becomes useful because the signed bytes describe the request and because the server compares the public key in the proof with the key thumbprint in the token.

A compact Rust sketch makes that relationship visible without pretending to be a complete client:

```rust
fn make_proof(key: &DpopKey, request: &Request, token: &str) -> Result<String> {
    let claims = Claims {
        jti: fresh_id(),
        htm: request.method().to_string(),
        htu: normalized_uri(request.url()),
        iat: now_seconds(),
        ath: sha256_base64url(token),
    };

    key.sign(claims)
}
```

The important line is not `sign`. It is that the method, normalized URI, timestamp, proof ID, and token hash come from the request that is about to be sent. A helper that signs an early URL and then lets a transport silently change the destination has separated the proof from the thing it claims.

## What the copied token is missing

In the opening incident, the observer has the access token but not the private key. The observer can copy the old proof too, but that proof describes the old request and eventually becomes stale; a verifier can also remember its `jti` and reject a second use.

DPoP therefore changes the attacker's job from “present this string” to “produce a fresh, correctly bound signature with this key.” That is a meaningful increase in difficulty, especially when the key is held by a platform keystore or another protected client boundary.

It is not an identity oracle. DPoP does not prove that the software is honest, that the endpoint is uncompromised, or that the person behind the client is legitimate. It proves control of a key at the time the proof is made.

The next post will move to the verifier and ask what must be checked before that proof is allowed through.

## References

- [RFC 7638: JSON Web Key (JWK) Thumbprint](https://www.rfc-editor.org/rfc/rfc7638)
- [RFC 7515: JSON Web Signature (JWS)](https://www.rfc-editor.org/rfc/rfc7515)
- [RFC 9449: DPoP proof and token binding](https://www.rfc-editor.org/rfc/rfc9449)
