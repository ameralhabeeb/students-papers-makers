export const createGoogleDocWithOutline = async (
  accessToken: string,
  title: string,
  outlineText: string
): Promise<string> => {
  // Create document
  const createRes = await fetch(`https://docs.googleapis.com/v1/documents`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title })
  });
  
  if (!createRes.ok) {
    throw new Error('Failed to create document');
  }
  
  const doc = await createRes.json();
  const documentId = doc.documentId;
  
  // Insert outline text
  const requests = [
    {
      insertText: {
        location: { index: 1 },
        text: outlineText
      }
    }
  ];
  
  const updateRes = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests })
  });
  
  if (!updateRes.ok) {
    console.error('Update failed', await updateRes.text());
    throw new Error('Failed to populate document');
  }
  
  return documentId;
};
