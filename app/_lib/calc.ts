export const safe = (n:number,d:number)=> d===0?0:n/d
export const roas = (r:any)=> safe(+r.revenue||0, +r.ad_cost||0)
export const cr = (r:any)=> safe(+r.orders||0, +r.visits||0)
export const aov = (r:any)=> safe(+r.revenue||0, +r.orders||0)
export const returnsRate = (r:any)=> safe(+r.returns||0, +r.orders||0)
