-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "tierId" INTEGER;

-- CreateTable
CREATE TABLE "TierSubscription" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tierId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TierSubscription_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierSubscription" ADD CONSTRAINT "TierSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TierSubscription" ADD CONSTRAINT "TierSubscription_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "Tier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
