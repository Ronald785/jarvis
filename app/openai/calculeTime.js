function calculeTime(startTime, endTime) {
    const elapsedTimeMs = endTime - startTime;
    const elapsedTimeSeconds = elapsedTimeMs / 1000;
    return elapsedTimeSeconds;
}

export default calculeTime;
