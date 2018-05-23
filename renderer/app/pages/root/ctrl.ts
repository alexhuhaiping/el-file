import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FSState, FSStateModel } from '../../state/fs';
import { LayoutState, LayoutStateModel } from '../../state/layout';
import { PrefsState, PrefsStateModel, UpdatePrefs } from '../../state/prefs';
import { Select, Store } from '@ngxs/store';
import { StatusState, StatusStateModel } from '../../state/status';
import { UpdateViewVisibility, ViewVisibility, ViewsState, ViewsStateModel } from '../../state/views';
import { WindowState, WindowStateModel } from '../../state/window';

import { ElectronService } from 'ngx-electron';
import { FSService } from '../../services/fs';
import { LifecycleComponent } from 'ellib';
import { Observable } from 'rxjs';
import { OnChange } from 'ellib';
import { RenameOperation } from '../../services/rename';
import { take } from 'rxjs/operators';

/**
 * Root controller
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-root-ctrl',
  styles: [':host { display: none; }'],
  template: ''
})

export class RootCtrlComponent extends LifecycleComponent {

  @Input() prefsForm = { } as PrefsStateModel;
  @Input() propsForm: any = { };
  @Input() viewForm: any = { };

  @Select(FSState) fs$: Observable<FSStateModel>;
  @Select(LayoutState) layout$: Observable<LayoutStateModel>;
  @Select(PrefsState) prefs$: Observable<PrefsStateModel>;
  @Select(StatusState) status$: Observable<StatusStateModel>;
  @Select(ViewsState) views$: Observable<ViewsStateModel>;
  @Select(WindowState) window$: Observable<WindowStateModel>;

  /** ctor */
  constructor(private electron: ElectronService,
              private fsSvc: FSService,
              private store: Store) {
    super();
    // set the initial bounds
    this.window$.pipe(take(1))
      .subscribe((window: WindowStateModel) => {
        const win = this.electron.remote.getCurrentWindow();
        if (window.bounds)
          win.setBounds(window.bounds);
      });
  }

  // bind OnChange handlers

  @OnChange('prefsForm') savePrefs() {
    if (this.prefsForm && this.prefsForm.submitted)
      this.store.dispatch(new UpdatePrefs(this.prefsForm));
  }

  @OnChange('propsForm') updateProps() {
    if (this.propsForm && this.propsForm.submitted) {
      const renameOp = RenameOperation.makeInstance(this.propsForm.path, this.propsForm.name, this.fsSvc);
      this.fsSvc.run(renameOp);
    }
  }

  @OnChange('viewForm') saveView() {
    if (this.viewForm && this.viewForm.submitted) {
      const allTheSame = !!this.viewForm.allTheSame;
      const viewID = this.viewForm.viewID;
      const visibility: ViewVisibility = { ...this.viewForm.visibility };
      this.store.dispatch(new UpdateViewVisibility({ viewID, visibility, allTheSame }));
    }
  }

}
