import * as argon2 from 'argon2'

/**
 * Hashes a password using Argon2id.
 * Argon2id is the recommended algorithm for password hashing as it provides
 * resistance against both GPU-based cracking and side-channel attacks.
 * 
 * @param password The plain text password to hash
 * @returns The hashed password (digest)
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    // argon2.hash uses Argon2id by default
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,         // 3 iterations
      parallelism: 1,      // 1 thread
    })
    return hash
  } catch (error) {
    console.error('Error hashing password:', error)
    throw new Error('Failed to hash password')
  }
}

/**
 * Verifies a plain text password against a stored hash.
 * 
 * @param hash The stored Argon2id hash
 * @param password The plain text password to check
 * @returns True if the password matches the hash, false otherwise
 */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch (error) {
    console.error('Error verifying password:', error)
    return false
  }
}
