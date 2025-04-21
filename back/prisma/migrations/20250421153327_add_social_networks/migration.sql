-- AlterTable
ALTER TABLE "Author" ADD COLUMN     "instagramUrl" VARCHAR(255),
ADD COLUMN     "linkedinUrl" VARCHAR(255),
ADD COLUMN     "tiktokUrl" VARCHAR(255),
ADD COLUMN     "twitchUrl" VARCHAR(255),
ADD COLUMN     "twitterUrl" VARCHAR(255),
ADD COLUMN     "youtubeUrl" VARCHAR(255);

-- AlterTable
ALTER TABLE "AuthorRequest" ADD COLUMN     "instagramUrl" VARCHAR(255),
ADD COLUMN     "linkedinUrl" VARCHAR(255),
ADD COLUMN     "tiktokUrl" VARCHAR(255),
ADD COLUMN     "twitchUrl" VARCHAR(255),
ADD COLUMN     "twitterUrl" VARCHAR(255),
ADD COLUMN     "youtubeUrl" VARCHAR(255);
