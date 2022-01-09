/**
 * Created by user on 2022/1/10.
 */

export default import('./download-original-plugin')
	.then(() => import('./unzip'))
	.then(() => import('./to-zht'))
;
