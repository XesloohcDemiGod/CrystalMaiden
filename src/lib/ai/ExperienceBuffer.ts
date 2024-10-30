export class ExperienceBuffer {
  private experiences: any[] = [];

  add(experience: any): void {
    this.experiences.push(experience);
  }

  getAll(): any[] {
    return this.experiences;
  }

  sample(size: number): any[] {
    // Basic random sampling implementation
    return this.experiences
      .sort(() => Math.random() - 0.5)
      .slice(0, size);
  }

  size(): number {
    return this.experiences.length;
  }

  clear(): void {
    this.experiences = [];
  }
} 