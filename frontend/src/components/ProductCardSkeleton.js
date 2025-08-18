import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Card } from 'react-bootstrap';

const ProductCardSkeleton = () => {
  return (
    <Card className="my-3 p-3 rounded shadow-sm h-100">
      <Skeleton height={180} />
      <Card.Body>
        <Card.Title as="div">
          <Skeleton count={2} />
        </Card.Title>
        <Card.Text as="h3" className="mt-2">
          <Skeleton width="50%" />
        </Card.Text>
      </Card.Body>
    </Card>
  );
};

export default ProductCardSkeleton;