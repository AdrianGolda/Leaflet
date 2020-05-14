function createZigzag(points){
    var x, y, lx, ly, mx, my, path;
    var height = 5;
    for (var i = 0; i < points.length; i++) {
        x = points[i].x;
        y = points[i].y;
        if (i === 0)
        {
            path = 'M ' + (x) + ' ' + (y) + ' L';
            continue;
        }
        lx = points[i - 1].x;
        ly = points[i - 1].y;
        mx = (lx + x) / 2;
        my = (ly + y) / 2;

        scale = sqrt(0.75);
        mx += scale * (y - ly);
        my -= scale * (x - lx);

        path += ' ' + (mx) + ' ' + (my);
        path += ' ' + (x) + ' ' + (y);
    }
    return path;
}
