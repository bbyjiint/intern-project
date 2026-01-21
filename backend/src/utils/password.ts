import argon2 from "argon2";

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
  });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  // The hash encodes the Argon2 variant/params; `verify` will use what's in the hash.
  return await argon2.verify(hash, password);
}

