/*
  Warnings:

  - You are about to drop the column `instagramUrl` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `tiktokUrl` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `twitchUrl` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `twitterUrl` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeUrl` on the `Author` table. All the data in the column will be lost.
  - You are about to drop the column `instagramUrl` on the `AuthorRequest` table. All the data in the column will be lost.
  - You are about to drop the column `linkedinUrl` on the `AuthorRequest` table. All the data in the column will be lost.
  - You are about to drop the column `tiktokUrl` on the `AuthorRequest` table. All the data in the column will be lost.
  - You are about to drop the column `twitchUrl` on the `AuthorRequest` table. All the data in the column will be lost.
  - You are about to drop the column `twitterUrl` on the `AuthorRequest` table. All the data in the column will be lost.
  - You are about to drop the column `youtubeUrl` on the `AuthorRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Author" DROP COLUMN "instagramUrl",
DROP COLUMN "linkedinUrl",
DROP COLUMN "tiktokUrl",
DROP COLUMN "twitchUrl",
DROP COLUMN "twitterUrl",
DROP COLUMN "youtubeUrl",
ADD COLUMN     "socials" JSONB;

-- AlterTable
ALTER TABLE "AuthorRequest" DROP COLUMN "instagramUrl",
DROP COLUMN "linkedinUrl",
DROP COLUMN "tiktokUrl",
DROP COLUMN "twitchUrl",
DROP COLUMN "twitterUrl",
DROP COLUMN "youtubeUrl",
ADD COLUMN     "socials" JSONB;
