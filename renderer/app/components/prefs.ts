import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { DrawerPanelComponent } from 'ellib';
import { LifecycleComponent } from 'ellib';
import { OnChange } from 'ellib';
import { PrefsStateModel } from '../state/prefs';

/**
 * Prefs component
 */

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'elfile-prefs',
  templateUrl: 'prefs.html',
  styleUrls: ['prefs.scss']
})

export class PrefsComponent extends LifecycleComponent {

  @Input() prefs = { } as PrefsStateModel;

  prefsForm: FormGroup;

  size = 259673;
  today = Date.now();

  /** ctor */
  constructor(private drawerPanel: DrawerPanelComponent,
              private formBuilder: FormBuilder) {
    super();
    // create prefs form controls
    this.prefsForm = this.formBuilder.group({
      dateFormat: '',
      quantityFormat: '',
      showGridLines: false,
      showHiddenFiles: false,
      sortDirectories: '',
      timeFormat: ''
    });
  }

  /** Close drawer */
  close() {
    this.drawerPanel.close();
  }

  // bind OnChange handlers

  @OnChange('prefs') patchPrefs() {
    if (this.prefs)
      this.prefsForm.patchValue(this.prefs, { emitEvent: false });
  }

}