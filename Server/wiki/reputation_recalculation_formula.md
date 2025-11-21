# Event Factor Calculation

The **Event Factor** measures how much a user's created events contribute to their reputation score.  
It evaluates the quality of events based on ratings, time decay, and adjusts for the number of events created to avoid bias from extreme values.

---

## Step-by-Step Formula

### 1. Weighted Event Ratings
Each event's rating is multiplied by a **decay factor** that slightly reduces its influence each day since it was reported.

Inline formula:  
$ \text{WeightedEventRating}_i = \text{EventRating}_i \times (\text{EVENT\_WEIGHT\_DECAY})^{\text{AgeInDays}_i} $

Total for all events:  
$$
\text{WeightedEventSum} = \sum_{i=1}^{n} \text{WeightedEventRating}_i
$$

---

### 2. Bayesian Smoothing
This step prevents distortion for users with very few events by pushing the accuracy toward the **global event accuracy**.

$$
\text{AdjustedEventAccuracy} =
\frac{
\text{WeightedEventSum} + \text{BAYESIAN\_SMOOTHING\_FACTOR} \times \text{GlobalEventAccuracy}
}{
\text{NumberOfEvents} + \text{BAYESIAN\_SMOOTHING\_FACTOR}
}
$$

---

### 3. Cap and Bonus Multiplier
The Event Factor grows with the number of events but is **capped** for fairness.

$$
\text{ScalingMultiplier} =
\min\left(
\frac{\text{NumberOfEvents}}{\text{EVENT\_CAP}},
\text{EVENT\_BONUS}
\right)
$$

---

### 4. Final Event Parameter
The adjusted accuracy multiplied by the scaling factor:

$$
\text{EventParameter} =
\text{AdjustedEventAccuracy} \times \text{ScalingMultiplier}
$$

---
# Community Trust Factor Calculation

The **Community Trust Factor** measures how long a user has been part of the community and rewards longevity with increasing trust, up to a maximum.

---

## Formula

The trust is proportional to the account age in days, capped at a defined maximum:

$$
\text{CommunityTrust} =
\min\left(
\frac{\text{AccountAgeDays}}{\text{MAX\_DAYS\_FOR\_COMMUNITY\_TRUST}},
1.0
\right)
$$

---
# Comment Factor Calculation

The **Comment Factor** measures how much a user's comments contribute to their reputation score.  
It considers comment ratings, applies time decay, and uses Bayesian smoothing to stabilize results for users with few comments.

---

## Step-by-Step Formula

### 1. Weighted Comment Ratings
Each comment rating is decayed based on its age in days:

$$
\text{WeightedCommentRating}_i =
\text{CommentRating}_i \times (\text{COMMENT\_WEIGHT\_DECAY})^{\text{AgeInDays}_i}
$$

Total decay-adjusted sum for all comments:

$$
\text{WeightedCommentSum} = \sum_{i=1}^{m} \text{WeightedCommentRating}_i
$$

---

### 2. Bayesian Smoothing
To reduce volatility for users with few comments, the calculation blends the user's ratings with the global comment accuracy:

$$
\text{AdjustedCommentAccuracy} =
\frac{
\text{WeightedCommentSum} + \text{BAYESIAN\_SMOOTHING\_FACTOR} \times \text{GlobalCommentAccuracy}
}{
\text{NumberOfComments} + \text{BAYESIAN\_SMOOTHING\_FACTOR}
}
$$

---

### 3. Final Comment Parameter
Since there is no event-like cap/bonus multiplier, the **Comment Parameter** is simply:

$$
\text{CommentParameter} = \text{AdjustedCommentAccuracy}
$$

---

# Final Reputation Formula

The **Reputation Score** combines contributions from:

1. **Base Reputation** (Default starting value)
2. **Community Trust Contribution**
3. **Event Factor Contribution**
4. **Comment Factor Contribution**

All components are clamped between a minimum and maximum possible reputation.

---

## Formula

$$
\text{Reputation} =
\text{DEFAULT\_REPUTATION} +
\text{CommunityTrustContribution} +
\text{EventContribution} +
\text{CommentContribution}
$$

Substituting each contribution:

$$
\begin{aligned}
\text{Reputation} &=
\text{DEFAULT\_REPUTATION} +
\text{COMMUNITY\_TRUST\_FACTOR} \times \text{CommunityTrust} \\
&\quad +\ \text{EVENT\_IMPACT\_FACTOR} \times \text{EventParameter} \\
&\quad +\ \text{COMMENT\_IMPACT\_FACTOR} \times \text{CommentParameter}
\end{aligned}
$$

---

## Clamping

To ensure the score stays within the valid range:

$$
\text{Reputation} =
\max(
\text{MIN\_REPUTATION},
\min(
\text{MAX\_REPUTATION},
\text{Reputation}
)
)
$$

---