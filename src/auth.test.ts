import { describe, it, expect } from "vitest";
import {
    makeJWT,
    validateJWT
} from "./auth.js";

describe("JWT", () => {

    it("should create and validate JWT", () => {

        const secret = "secret";

        const token =
            makeJWT(
                "123",
                3600,
                secret
            );

        const userID =
            validateJWT(
                token,
                secret
            );

        expect(userID).toBe("123");

    });

    it("should reject wrong secret", () => {

        const token =
            makeJWT(
                "123",
                3600,
                "secret1"
            );

        expect(() =>
            validateJWT(
                token,
                "secret2"
            )
        ).toThrow();

    });

    it("should reject expired JWT", () => {

        const token =
            makeJWT(
                "123",
                -1,
                "secret"
            );

        expect(() =>
            validateJWT(
                token,
                "secret"
            )
        ).toThrow();

    });

});
