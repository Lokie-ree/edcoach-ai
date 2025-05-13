'use client'

import React from 'react'
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Id } from '../../../convex/_generated/dataModel';

const DevPage = () => {
  const indicatorId = "kn7b50v85azxspt731b4asfzbn7ftbn9" as Id<"rubricIndicators">; // Replace with a real ID Replace with a real ID

  const indicator = useQuery(api.indicatorQueries.getRubricIndicator, {
    indicatorId,
  });

  const minimalIndicator = indicator && {
    _id: indicator._id,
    indicator_name: indicator.indicator_name,
    indicator_code: indicator.indicator_code,
    overview: indicator.overview,
    createdAt: indicator.createdAt,
  }

  return (
    <div>
      <h2>Minimum Indicator Object</h2>
      <pre>{JSON.stringify(minimalIndicator, null, 2)}</pre>
    </div>
  )
}

export default DevPage