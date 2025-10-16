export async function uploadToImgBB(file: File): Promise<string> {
    const IMGBB_API_KEY = '2857d634922be62f9aec8e82cb24cf90';
    const formData = new FormData();
    formData.append('key', IMGBB_API_KEY);
    formData.append('image', file);

    const response = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: formData,
    });
    const json = await response.json();
    if (json.success) {
        return json.data.url;
    } else {
        throw new Error('Upload à ImgBB échoué : ' + JSON.stringify(json));
    }
}
