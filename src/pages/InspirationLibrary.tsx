import { InspirationManager } from '../components/InspirationManager';
import { PageHeader } from '../components/ui';

export function InspirationLibrary() {
  return (
    <div>
      <PageHeader
        title="Inspiration Library"
        description="Creators whose post structure you admire. Pick one when generating to blend their rhythm with your voice."
      />
      <InspirationManager />
    </div>
  );
}
