-- CreateTable
CREATE TABLE "DrawerState" (
    "boxId" INTEGER NOT NULL,
    "isOpen" BOOLEAN NOT NULL DEFAULT false,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DrawerState_pkey" PRIMARY KEY ("boxId")
);
