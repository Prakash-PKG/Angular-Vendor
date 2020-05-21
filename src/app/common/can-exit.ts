
import { Observable } from 'rxjs';
export interface CanExit {
    canDeactivate: () => boolean;
}