+++
title = "Where the Proof Gets Sharp"
date = 2026-10-03
description = "DPoP's difficult work lives at boundaries: keys, URLs, clocks, proxies, replay caches, and incomplete support."
taxonomies = { tags = ["OAuth", "Security", "DPoP", "Operations"], series = ["Proof-Carrying HTTP: Understanding DPoP"] }

[extra]
series_order = 5
+++

The cryptographic operation in a DPoP client is usually one function call. The production incidents arrive around it.

{{ <dpop_figure src="images/dpop/05-sharp-edges.svg" alt="A DPoP request crosses key storage, redirects, proxies, clocks, and a replay cache, each with a distinct operational failure mode." caption="A proof can be mathematically valid and still fail at the boundary that interprets it." /> }}

## The key has a life

A client must decide where the private key is generated, how it is protected, when it rotates, and what happens to tokens bound to the old key. Rotating only the key invalidates the relationship the token carries; rotating only the token leaves the key lifecycle unclear. Treating the key as ordinary configuration is a subtle way to turn proof of possession back into a copyable secret.

A small Rust type can make the intended ownership visible:

```rust
struct DpopKey {
    signing_key: ProtectedKey,
    public_thumbprint: String,
}

impl DpopKey {
    fn proof_for(&self, request: &Request, token: &str) -> Result<String> {
        // The key signs; the request supplies htm and htu.
    }
}
```

This is deliberately incomplete. The point is that the key object owns signing, while request construction owns the method and URI. A complete implementation still needs a platform-appropriate storage policy.

## The URL has several lives too

The client may start with one URL, a transport may follow a redirect, and a proxy may reconstruct the external host from forwarding headers. The proof must match the URI semantics that the resource server validates. If the client signs an internal hop while the verifier compares an external URL, a legitimate request fails; if the verifier normalizes inconsistently, an attacker may find a mismatch worth probing.

The safest practice is to make the URI policy explicit and test it with redirects, ports, query strings, fragments, and proxy headers. DPoP does not remove the need to understand the route a request actually took.

## Time and replay are shared state

`iat` makes clock skew a security input. A small acceptance window limits replay but makes unsynchronized hosts fail in surprising ways. `jti` makes the verifier remember recent proofs, which means a horizontally scaled resource server needs an appropriately bounded and consistent replay cache.

The cache is not merely a performance detail. It is part of the security boundary, and its eviction, replication, and failure behavior determine whether a copied proof is rejected, accepted twice, or rejected for everyone during an outage.

## Support is part of the protocol

An authorization server may issue ordinary bearer tokens even when a client sends DPoP-shaped requests. A gateway may forward the access token and drop the proof header. A library may create a key and sign a JWT but omit token binding, nonce handling, or the correct URI normalization. These failures are why “the signature verifies” is not a sufficient integration test.

A useful diagnostic question is always: **which artifact failed, and at which boundary?** Token issuance, proof creation, transport, gateway forwarding, resource-server verification, and replay state each need a different answer.

DPoP therefore has a larger operational surface than a bearer token. Its promise is stronger precisely because it asks more components to agree about the same request.

The final post will explain why that trade can still be worthwhile, and why the right conclusion is a measured choice rather than a universal recommendation.

## References

- [RFC 9449, Section 4: Resource Server Processing](https://www.rfc-editor.org/rfc/rfc9449#section-4)
- [RFC 9449, Section 5: Authorization Server Processing](https://www.rfc-editor.org/rfc/rfc9449#section-5)
- [RFC 7638: JWK Thumbprints](https://www.rfc-editor.org/rfc/rfc7638)
