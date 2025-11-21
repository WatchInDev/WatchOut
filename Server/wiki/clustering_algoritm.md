# Clustering Algorithm: Get Clustered Events by Location

## Overview
This operation retrieves **clustered events** within a specified bounding box, defined by **South-West** and **North-East** coordinates.  
The clustering is based on the **density of events** using DBSCAN (Density-Based Spatial Clustering of Applications with Noise).

## Parameters
- **eps** (`degrees`): Maximum distance between two geometries for one to be considered as part of the other's neighborhood.
    - Example: `0.01` degrees ≈ ~1.11 km
- **minPoints**: Minimum number of events required to form a cluster.

## Clustering Rules
An event is added to a cluster if it is either:

1. **Core geometry**
    - Within `eps` distance of at least `minPoints` events (including itself).

2. **Border geometry**
    - Within `eps` distance of a **core geometry**.

Events that are **neither core nor border** are treated as **noise** and excluded from clusters.

## Output
For each cluster:
- **Centroid (longitude, latitude)** calculated via `ST_Centroid`.
- **Count** of events in the cluster.

## Optional Filters
- `eventTypeIds`: List of event type IDs.
- `reportedDateFrom`: Include events reported after this date.
- `reportedDateTo`: Include events reported before this date.
- `distance`: Maximum distance (`degrees`) from the bounding box center.
- `rating`: Minimum event rating.

---