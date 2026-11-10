# Physical reasoning and equations

## Starting from the original observation

When you stand up after the last sliver of the Sun has disappeared, your eyes move higher above Earth's surface. The horizon is farther away in distance and dips lower relative to your local horizontal. This can reveal a sliver of the Sun again.

The geometric change can be represented by a right triangle joining the Earth's center, the observer and the tangent point on the horizon. The tangent line touches the spherical Earth at 90° to its radius.

If the planet has radius **R** and the observer's eye height is **h**:

    cos(theta) = R / (R + h)
    theta(h) = acos(R / (R + h))

For a lower eye height **h1** and higher height **h2**, the extra angle is:

    deltaTheta = theta(h2) - theta(h1)

A simplified model converts the measured time difference **t** to an angle, assuming a constant apparent *vertical* motion rate:

    deltaTheta = omega * t
    omega = 2*pi / 86400 radians/second (simplified baseline)

The simulator numerically solves for **R** using these two relationships. For small observer heights compared to the planet radius:

    theta(h) ~= sqrt(2h/R)
    R ~= 2 * (sqrt(h2) - sqrt(h1))^2 / deltaTheta^2

When h1 = 0, this becomes R ~= 2*h2/deltaTheta^2.

### Example
Assume lower eye height 0m, higher eye height 1.83m and a delay of 11 seconds. The simplified baseline yields an inferred radius around **5,700 km**. This is in the rough vicinity of Earth's average radius (about 6,371 km), but it is not a high-precision measurement.

### Limitations and interpretation
- The Earth's revolution relative to the Sun does not imply the visible Sun moves vertically at exactly 2*pi/86400 radians per second everywhere. Latitude, date and sunset angle matter.
- Atmospheric refraction alters the horizon and apparent solar position.
- Actual eye height and lower eye height need to be measured, not guessed.
- Timing by counting seconds introduces uncertainty.
- The visual animation and geometric illustration are schematic and not to scale.

This companion application was AI-assisted and based on the user's original line of physical reasoning about perspective, height, curvature, horizon and sunset time.
