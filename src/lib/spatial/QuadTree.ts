// src/lib/spatial/QuadTree.ts
import { Vector3 } from 'three';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class QuadTree<T> {
  private boundary: BoundingBox;
  private capacity: number;
  private items: T[];
  private divided: boolean;
  private northwest?: QuadTree<T>;
  private northeast?: QuadTree<T>;
  private southwest?: QuadTree<T>;
  private southeast?: QuadTree<T>;

  constructor(boundary: BoundingBox, capacity = 4) {
    this.boundary = boundary;
    this.capacity = capacity;
    this.items = [];
    this.divided = false;
  }

  public insert(item: T, position: Vector3): boolean {
    if (!this.contains(position)) {
      return false;
    }

    if (this.items.length < this.capacity) {
      this.items.push(item);
      return true;
    }

    if (!this.divided) {
      this.subdivide();
    }

    return (
      this.northwest!.insert(item, position) ||
      this.northeast!.insert(item, position) ||
      this.southwest!.insert(item, position) ||
      this.southeast!.insert(item, position)
    );
  }

  public query(range: BoundingBox): T[] {
    const found: T[] = [];

    if (!this.intersects(range)) {
      return found;
    }

    for (const item of this.items) {
      found.push(item);
    }

    if (this.divided) {
      found.push(...this.northwest!.query(range));
      found.push(...this.northeast!.query(range));
      found.push(...this.southwest!.query(range));
      found.push(...this.southeast!.query(range));
    }

    return found;
  }

  private contains(point: Vector3): boolean {
    return (
      point.x >= this.boundary.x &&
      point.x < this.boundary.x + this.boundary.width &&
      point.z >= this.boundary.y &&
      point.z < this.boundary.y + this.boundary.height
    );
  }

  private intersects(range: BoundingBox): boolean {
    return !(
      range.x > this.boundary.x + this.boundary.width ||
      range.x + range.width < this.boundary.x ||
      range.y > this.boundary.y + this.boundary.height ||
      range.y + range.height < this.boundary.y
    );
  }

  private subdivide(): void {
    const x = this.boundary.x;
    const y = this.boundary.y;
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;

    const nw = { x: x, y: y, width: w, height: h };
    const ne = { x: x + w, y: y, width: w, height: h };
    const sw = { x: x, y: y + h, width: w, height: h };
    const se = { x: x + w, y: y + h, width: w, height: h };

    this.northwest = new QuadTree<T>(nw, this.capacity);
    this.northeast = new QuadTree<T>(ne, this.capacity);
    this.southwest = new QuadTree<T>(sw, this.capacity);
    this.southeast = new QuadTree<T>(se, this.capacity);

    this.divided = true;
  }
}
