-- CreateEnum
CREATE TYPE "InvestmentCategoryType" AS ENUM ('FIXED_INCOME', 'REAL_ESTATE', 'STOCKS', 'CUSTOM', 'EMERGENCY_FUND', 'CRYPTO');

-- CreateTable
CREATE TABLE "InvestmentCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InvestmentCategoryType" NOT NULL,
    "description" TEXT,
    "color" TEXT NOT NULL DEFAULT '#9600ff',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentAllocation" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "percentage" DECIMAL(5,2),
    "targetPercentage" DECIMAL(5,2),
    "userId" TEXT NOT NULL,
    "investmentCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentAllocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentGoal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DECIMAL(10,2) NOT NULL,
    "currentAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvestmentGoal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentCategory_name_userId_key" ON "InvestmentCategory"("name", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentAllocation_userId_investmentCategoryId_key" ON "InvestmentAllocation"("userId", "investmentCategoryId");

-- AddForeignKey
ALTER TABLE "InvestmentAllocation" ADD CONSTRAINT "InvestmentAllocation_investmentCategoryId_fkey" FOREIGN KEY ("investmentCategoryId") REFERENCES "InvestmentCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
