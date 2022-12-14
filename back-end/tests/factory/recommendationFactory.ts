import { faker } from "@faker-js/faker";

export function recommendationFactory() {
    const name = faker.name.fullName()
    const youtubeLink = `https://www.youtube.com/watch`;

    return { name, youtubeLink };
}