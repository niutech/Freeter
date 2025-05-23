/*
 * Copyright: (c) 2024, Alex Kaul
 * GNU General Public License v3.0 or later (see COPYING or https://www.gnu.org/licenses/gpl-3.0.txt)
 */

import { createSwitchWorkflowUseCase } from '@/application/useCases/workflowSwitcher/switchWorkflow';
import { AppState } from '@/base/state/app';
import { fixtureAppState } from '@tests/base/state/fixtures/appState';
import { fixtureProjectAInColl } from '@tests/base/state/fixtures/entitiesState';
import { fixtureMemSaver } from '@tests/base/state/fixtures/memSaver';
import { fixtureAppStore } from '@tests/data/fixtures/appStore';

async function setup(initState: AppState) {
  const [appStore] = await fixtureAppStore(initState);
  const deactivateWorkflowUseCase = jest.fn();
  const switchWorkflowUseCase = createSwitchWorkflowUseCase({
    appStore,
    deactivateWorkflowUseCase
  });
  return {
    appStore,
    switchWorkflowUseCase
  }
}

describe('switchWorkflowUseCase()', () => {
  it('should do nothing, when specified project does not exist', async () => {
    const initState = fixtureAppState({
      entities: {
        projects: {
          ...fixtureProjectAInColl()
        }
      }
    })
    const {
      appStore,
      switchWorkflowUseCase
    } = await setup(initState)
    const expectState = appStore.get();

    switchWorkflowUseCase('NO-SUCH-PROJECT', 'WORKFLOW-ID');

    expect(appStore.get()).toBe(expectState);
  });

  it('should update current workflow id and activate it in mem saver, when specified project exists', async () => {
    const projectId = 'PROJECT-ID';
    const newWorkflowId = 'NEW-WORKFLOW-ID';
    const initState = fixtureAppState({
      entities: {
        projects: {
          ...fixtureProjectAInColl({ id: projectId })
        }
      },
      ui: {
        memSaver: fixtureMemSaver({
          activeWorkflows: []
        })
      }
    })
    const expectState: AppState = {
      ...initState,
      entities: {
        ...initState.entities,
        projects: {
          ...initState.entities.projects,
          [projectId]: {
            ...initState.entities.projects[projectId]!,
            currentWorkflowId: newWorkflowId
          }
        }
      },
      ui: {
        ...initState.ui,
        memSaver: {
          ...initState.ui.memSaver,
          activeWorkflows: [
            ...initState.ui.memSaver.activeWorkflows,
            { prjId: projectId, wflId: newWorkflowId }
          ]
        }
      }
    }
    const {
      appStore,
      switchWorkflowUseCase
    } = await setup(initState)

    switchWorkflowUseCase(projectId, newWorkflowId);

    expect(appStore.get()).toEqual(expectState);
  })
})
