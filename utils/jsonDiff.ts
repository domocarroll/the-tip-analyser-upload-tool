
// A simple recursive diff function to find changes between two JSON objects.
// It returns a Set of string paths to the changed values in the new object.

const isObject = (obj: any): obj is Record<string, any> => obj && typeof obj === 'object' && !Array.isArray(obj);

const diffRecursively = (
  oldObj: any,
  newObj: any,
  path: string,
  changes: Set<string>
) => {
  if (oldObj === newObj) return;

  if (!isObject(oldObj) || !isObject(newObj)) {
    if (oldObj !== newObj) {
      changes.add(path);
    }
    return;
  }

  const oldKeys = Object.keys(oldObj);
  const newKeys = Object.keys(newObj);

  // Check for added/removed keys at the object level if necessary
  if (oldKeys.length !== newKeys.length && Array.isArray(newObj)) {
     // If an item is added or removed from an array, we can highlight the whole array or parent.
     // For simplicity here, we'll just check values.
  }

  for (const key of newKeys) {
    const newPath = path ? `${path}.${key}` : key;
    if (!oldObj.hasOwnProperty(key)) {
      // Key added in newObj
      changes.add(newPath);
    } else {
      diffRecursively(oldObj[key], newObj[key], newPath, changes);
    }
  }

   for (const key of oldKeys) {
        if (!newObj.hasOwnProperty(key)) {
            // Key was removed in newObj
            // We don't have a path for something that doesn't exist in the new obj,
            // so we could highlight the parent if needed.
        }
    }
};

export const diffJson = (oldJson: any, newJson: any): Set<string> => {
  const changes: Set<string> = new Set();
  diffRecursively(oldJson, newJson, '', changes);
  
  // The recursive function uses dot notation like '0.tips.1.tipsterName'.
  // Let's convert this to a more usable format for our component keys.
  const formattedChanges = new Set<string>();
  changes.forEach(changePath => {
      // e.g. "0.tips.1.selections.0.horseName" -> "race-0-tipster-1-selection-0-horseName"
      let parts = changePath.split('.');
      let formattedPath = `race-${parts[0]}`; // Race index
      if (parts[1] === 'tips' && parts.length > 2) {
          formattedPath += `-tipster-${parts[2]}`; // Tipster index
          if (parts[3] === 'selections' && parts.length > 4) {
              formattedPath += `-selection-${parts[4]}`; // Selection index
              if(parts.length > 5) {
                formattedPath += `-${parts[5]}`; // Property name
              }
          } else if (parts.length > 3) {
             formattedPath += `-${parts[3]}`; // Property name on tipster
          }
      }
      formattedChanges.add(formattedPath);
  });

  return formattedChanges;
};