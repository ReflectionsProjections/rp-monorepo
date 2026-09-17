import { describe, expect, it, beforeEach } from "@jest/globals";
import { SupabaseDB } from "../../database";
import { TESTER } from "../../../testing/testingTools";
import { Tiers, IconColors } from "./attendee-schema";
import {
    addPoints,
    getTierForPoints,
    TIER_POINT_THRESHOLDS,
} from "./attendee-utils";

describe("getTierForPoints", () => {
    it("uses the point thresholds shared with the mobile point shop", () => {
        expect(TIER_POINT_THRESHOLDS).toEqual({
            TIER1: 0,
            TIER2: 40,
            TIER3: 60,
            TIER4: 90,
        });
    });

    it.each([
        [0, "TIER1"],
        [39, "TIER1"],
        [40, "TIER2"],
        [59, "TIER2"],
        [60, "TIER3"],
        [89, "TIER3"],
        [90, "TIER4"],
        [130, "TIER4"],
    ])("maps %i points to %s", (points, tier) => {
        expect(getTierForPoints(points)).toBe(tier);
    });

    it("treats null, undefined and negative points as TIER1", () => {
        expect(getTierForPoints(null)).toBe("TIER1");
        expect(getTierForPoints(undefined)).toBe("TIER1");
        expect(getTierForPoints(-5)).toBe("TIER1");
    });
});

describe("addPoints", () => {
    const userId = TESTER.userId;

    beforeEach(async () => {
        await SupabaseDB.ATTENDEES.delete().throwOnError();
        await SupabaseDB.REGISTRATIONS.delete().throwOnError();
        await SupabaseDB.REGISTRATIONS.insert({
            userId,
            name: TESTER.displayName,
            email: TESTER.email,
            educationLevel: "Undergraduate",
            school: "University of Illinois Urbana-Champaign",
            isInterestedMechMania: false,
            isInterestedPuzzleBang: false,
            allergies: [],
            dietaryRestrictions: [],
            gender: "Prefer not to say",
            ethnicity: [],
            graduationYear: "2027",
        }).throwOnError();
        await SupabaseDB.ATTENDEES.insert({
            userId,
            points: 35,
            favoriteEvents: [],
            currentTier: Tiers.Enum.TIER1,
            icon: IconColors.Enum.RED,
            hasPriorityMon: false,
            hasPriorityTue: false,
            hasPriorityWed: false,
            hasPriorityThu: false,
            hasPriorityFri: false,
            hasPrioritySat: false,
            hasPrioritySun: false,
            puzzlesCompleted: [],
            tags: [],
        }).throwOnError();
    });

    it("keeps currentTier in sync with the new points total", async () => {
        await addPoints(userId, 10);

        const { data } = await SupabaseDB.ATTENDEES.select(
            "points, currentTier"
        )
            .eq("userId", userId)
            .single()
            .throwOnError();

        expect(data).toEqual({ points: 45, currentTier: "TIER2" });
    });

    it("leaves currentTier unchanged when no threshold is crossed", async () => {
        await addPoints(userId, 2);

        const { data } = await SupabaseDB.ATTENDEES.select(
            "points, currentTier"
        )
            .eq("userId", userId)
            .single()
            .throwOnError();

        expect(data).toEqual({ points: 37, currentTier: "TIER1" });
    });
});
