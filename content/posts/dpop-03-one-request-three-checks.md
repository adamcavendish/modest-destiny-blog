+++
title = "One Request, Three Checks"
date = 2026-10-03
description = "A DPoP verifier turns a proof into a decision by checking the key, the request, and the proof's freshness."
taxonomies = { tags = ["OAuth", "Security", "DPoP"], series = ["Proof-Carrying HTTP: Understanding DPoP"] }

[extra]
series_order = 3
+++

A DPoP verifier should not feel like a single opaque function called `validate`. It is a gate with a few visible questions, and each question closes a different replay path.

{{ <dpop_figure src="images/dpop/03-verifier-gate.svg" alt="A DPoP request passes through key, request, and time checks before the server allows or rejects it." caption="The order makes the proof auditable: establish the key, bind the request, then spend freshness." /> }}

## First: did the bound key sign this proof?

The verifier decodes the JWT and requires the DPoP type, an allowed asymmetric algorithm, and a public JWK in the header. It verifies the signature with that JWK, computes its thumbprint, and compares the result with the access token's `cnf.jkt` confirmation claim.

This check keeps a valid key from being swapped in after the token was issued. It also prevents algorithm confusion: the verifier chooses acceptable algorithms by policy instead of letting an untrusted header choose the verification rules.

## Second: does the proof describe this request?

The verifier compares `htm` with the actual HTTP method and `htu` with the target URI after applying the protocol's normalization rules. Query and fragment handling, host names, ports, and reverse-proxy reconstruction are not cosmetic details; they decide whether the proof describes the request the resource server believes it received.

If an access token is present, the verifier hashes its ASCII representation and compares the base64url value with `ath`. A proof for one token must not become a wrapper around another token merely because both use the same key.

## Third: is this proof fresh and unused?

`iat` must fall within an allowed clock-skew window. `jti` must not already be present in the replay cache for the relevant key and acceptance window. The cache needs bounded retention and a consistent enough view across resource-server instances that the same proof cannot race through two nodes.

A useful implementation shape is small and explicit:

```rust
fn verify_dpop(proof: &str, req: &Request, token: &Token) -> Result<BoundKey> {
    let jwt = decode_and_verify_signature(proof)?;
    require_dpop_header(&jwt.header)?;
    let key = key_from_jwk(&jwt.header.jwk)?;
    require_token_binding(&key, token)?;
    require_request_binding(&jwt.claims, req, token)?;
    require_fresh_iat(&jwt.claims)?;
    replay_cache.insert_once(&key, &jwt.claims.jti)?;
    Ok(key)
}
```

This is not a library recipe. It is a map of responsibilities. A failure can now be named: the signature was invalid, the key did not match, the URL differed, the token hash differed, the clock was outside the window, or the proof ID had already been spent.

## What order protects

Signature verification comes before trusting claims. Request binding comes before recording a replay identifier. Recording arbitrary `jti` values before the proof is meaningful would let an attacker fill the cache with noise; recording only after the checks pass makes the cache represent accepted proof attempts.

Some deployments add a server-provided nonce when the authorization server or resource server requires stronger freshness coordination. A nonce does not remove the other checks; it adds another value the client must carry into its next proof.

The opening replay now fails in more than one way. A copied token has no private key, a copied proof has the wrong request or a spent `jti`, and a new proof made with an unrelated key fails the token-binding comparison.

The next post asks a different question: what other industrial designs could have carried this burden, and what did DPoP choose to make easier or harder?

## References

- [RFC 9449, Section 4: Resource Server Processing](https://www.rfc-editor.org/rfc/rfc9449#section-4)
- [RFC 9449, Section 8: Replay Detection](https://www.rfc-editor.org/rfc/rfc9449#section-8)
- [RFC 8725: JSON Web Token Best Current Practices](https://www.rfc-editor.org/rfc/rfc8725)
