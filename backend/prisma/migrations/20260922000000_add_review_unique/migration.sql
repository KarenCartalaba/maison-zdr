-- CreateIndex
CREATE UNIQUE INDEX "Review_userId_eventId_key" ON "Review"("userId", "eventId");
