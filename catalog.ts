import {
  EntityProvider,
  EntityProviderConnection,
} from '@backstage/plugin-catalog-node';
import axios from 'axios';
// import  from 'node-fetch';
export class CustomEntityProvider implements EntityProvider {
  private connection!: EntityProviderConnection;
  getProviderName(): string {
    return 'custom-entity-provider';
  }
  async connect(connection: EntityProviderConnection): Promise<void> {
    this.connection = connection;
  }
  async refresh(): Promise<void> {
    const res = await axios('http://localhost:7007/integration/data');

    const entities = res.data.map((item: any) => ({
      apiVersion: 'backstage.io/v1alpha1',
      kind: 'Component',
      metadata: {
        name: item.id,
        namespace: 'default',
        description: item.name,
        tags: [item.tag],
        annotations: {
          'backstage.io/techdocs-ref': 'dir:.',
        },
      },
      spec: {
        type: 'service',
        lifecycle: 'experimental',
        owner: 'guest',
      },
    }));
    await this.connection.applyMutation({
      type: 'full',
      entities: entities.map(entity => ({
        entity,
        locationKey: 'custom-entity-provider',
      })),
    });
  }
}
